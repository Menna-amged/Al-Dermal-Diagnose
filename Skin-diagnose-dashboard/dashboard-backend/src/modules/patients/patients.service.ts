import { prisma } from "../../config/prisma";
import { hashPassword } from "../../utils/hash";
import crypto from "crypto";

const toPatient = (p: any) => ({
  id: p.user.id,
  name: [p.user.firstName, p.user.lastName].filter(Boolean).join(" ") || p.user.email,
  email: p.user.email,
  phone: p.user.phone || "",
  age: p.user.age,
  gender: p.user.gender || "",
  status: p.user.isVerified ? "ACTIVE" : "INACTIVE",
  bloodType: p.bloodType || "",
  lastVisit: p.lastVisit,
  doctor: p.assignedDoctor
    ? [p.assignedDoctor.user.firstName, p.assignedDoctor.user.lastName].filter(Boolean).join(" ")
    : "",
  createdAt: p.user.createdAt,
});

const doctorInclude = {
  assignedDoctor: { include: { user: { select: { firstName: true, lastName: true } } } },
};

export const getAllPatients = async () => {
  const patients = await prisma.patient.findMany({
    include: { user: true, ...doctorInclude },
    orderBy: { user: { createdAt: "desc" } },
  });
  return patients.map(toPatient);
};

export const createPatient = async (data: {
  name: string; email: string; phone?: string; age?: number;
  gender?: string; bloodType?: string; doctor?: string; status?: string;
}) => {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    if (existingUser.role === "DOCTOR") throw new Error("This email is already registered as a doctor");
    throw new Error("A patient with this email already exists");
  }

  const [firstName, ...rest] = data.name.trim().split(" ");
  const lastName = rest.join(" ") || undefined;

  let assignedDoctorId: string | undefined;
  if (data.doctor) {
    const [fn, ...ln] = data.doctor.trim().split(" ");
    const found = await prisma.doctor.findFirst({
      where: { user: { firstName: fn, ...(ln.length ? { lastName: ln.join(" ") } : {}) } },
    });
    if (found) assignedDoctorId = found.id;
  }

  const tempPassword = await hashPassword(crypto.randomBytes(12).toString("hex"));

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: tempPassword,
      firstName,
      lastName,
      phone: data.phone,
      age: data.age,
      gender: data.gender,
      role: "PATIENT",
      isVerified: data.status?.toUpperCase() === "ACTIVE",
    },
  });

  const patient = await prisma.patient.create({
    data: {
      userId: user.id,
      bloodType: data.bloodType,
      ...(assignedDoctorId ? { assignedDoctorId } : {}),
    },
    include: { user: true, ...doctorInclude },
  });

  return toPatient(patient);
};

export const updatePatient = async (userId: string, data: {
  name?: string; email?: string; phone?: string; age?: number;
  gender?: string; bloodType?: string; doctor?: string; status?: string;
}) => {
  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) throw new Error("Patient not found");

  if (data.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing && existing.id !== userId) {
      if (existing.role === "DOCTOR") throw new Error("This email is already registered as a doctor");
      throw new Error("A patient with this email already exists");
    }
  }

  const userUpdateData: any = {};
  if (data.email)  userUpdateData.email  = data.email;
  if (data.phone !== undefined) userUpdateData.phone = data.phone;
  if (data.age)    userUpdateData.age    = data.age;
  if (data.gender) userUpdateData.gender = data.gender;
  if (data.status) userUpdateData.isVerified = data.status.toUpperCase() === "ACTIVE";
  if (data.name) {
    const [firstName, ...rest] = data.name.trim().split(" ");
    userUpdateData.firstName = firstName;
    userUpdateData.lastName  = rest.join(" ") || null;
  }

  const patientUpdateData: any = {};
  if (data.bloodType !== undefined) patientUpdateData.bloodType = data.bloodType;
  if (data.doctor !== undefined) {
    if (!data.doctor) {
      patientUpdateData.assignedDoctorId = null;
    } else {
      const [fn, ...ln] = data.doctor.trim().split(" ");
      const found = await prisma.doctor.findFirst({
        where: { user: { firstName: fn, ...(ln.length ? { lastName: ln.join(" ") } : {}) } },
      });
      patientUpdateData.assignedDoctorId = found ? found.id : null;
    }
  }

  await Promise.all([
    Object.keys(userUpdateData).length > 0 ? prisma.user.update({ where: { id: userId }, data: userUpdateData }) : Promise.resolve(),
    Object.keys(patientUpdateData).length > 0 ? prisma.patient.update({ where: { userId }, data: patientUpdateData }) : Promise.resolve(),
  ]);

  const updated = await prisma.patient.findUnique({ where: { userId }, include: { user: true, ...doctorInclude } });
  return toPatient(updated!);
};

export const deletePatient = async (userId: string) => {
  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) throw new Error("Patient not found");
  await prisma.patient.delete({ where: { userId } });
  return prisma.user.delete({ where: { id: userId } });
};
