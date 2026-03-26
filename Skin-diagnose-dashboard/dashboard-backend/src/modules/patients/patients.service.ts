import { prisma } from "../../config/prisma";
import { hashPassword } from "../../utils/hash";
import crypto from "crypto";

const toPatient = (u: any) => ({
  id: u.id,
  name: [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email,
  email: u.email,
  phone: u.phone || "",
  age: u.age,
  gender: u.gender || "",
  status: u.isVerified ? "ACTIVE" : "INACTIVE",
  bloodType: u.bloodType || "",
  lastVisit: u.lastVisit,
  doctor: u.assignedDoctor
    ? [u.assignedDoctor.firstName, u.assignedDoctor.lastName].filter(Boolean).join(" ")
    : "",
  createdAt: u.createdAt,
});

const doctorInclude = { assignedDoctor: { select: { firstName: true, lastName: true } } };

export const getAllPatients = async () => {
  const patients = await prisma.user.findMany({
    where: { role: "PATIENT" },
    include: doctorInclude,
    orderBy: { createdAt: "desc" },
  });
  return patients.map(toPatient);
};

export const createPatient = async (data: {
  name: string; email: string; phone?: string; age?: number;
  gender?: string; bloodType?: string; doctor?: string; status?: string;
}) => {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    if (existingUser.role === "DOCTOR")
      throw new Error("This email is already registered as a doctor");
    throw new Error("A patient with this email already exists");
  }

  const [firstName, ...rest] = data.name.trim().split(" ");
  const lastName = rest.join(" ") || undefined;

  let assignedDoctorId: string | undefined;
  if (data.doctor) {
    const [fn, ...ln] = data.doctor.trim().split(" ");
    const found = await prisma.user.findFirst({
      where: { role: "DOCTOR", firstName: fn, ...(ln.length ? { lastName: ln.join(" ") } : {}) },
    });
    if (found) assignedDoctorId = found.id;
  }

  const tempPassword = await hashPassword(crypto.randomBytes(12).toString("hex"));

  const created = await prisma.user.create({
    data: {
      email: data.email,
      password: tempPassword,
      firstName,
      lastName,
      phone: data.phone,
      age: data.age,
      gender: data.gender,
      bloodType: data.bloodType,
      role: "PATIENT",
      isVerified: true,
      ...(assignedDoctorId ? { assignedDoctorId } : {}),
    },
    include: doctorInclude,
  });
  return toPatient(created);
};

export const updatePatient = async (id: string, data: {
  name?: string; email?: string; phone?: string; age?: number;
  gender?: string; bloodType?: string; doctor?: string; status?: string;
}) => {
  const user = await prisma.user.findFirst({ where: { id, role: "PATIENT" } });
  if (!user) throw new Error("Patient not found");

  if (data.email && data.email !== user.email) {
    const conflict = await prisma.user.findUnique({ where: { email: data.email } });
    if (conflict) {
      if (conflict.role === "DOCTOR")
        throw new Error("This email is already registered as a doctor");
      throw new Error("A patient with this email already exists");
    }
  }

  const updateData: any = {};
  if (data.email)    updateData.email     = data.email;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.age)      updateData.age       = data.age;
  if (data.gender)   updateData.gender    = data.gender;
  if (data.bloodType !== undefined) updateData.bloodType = data.bloodType;
  if (data.status) {
    updateData.isVerified = data.status.toUpperCase() === "ACTIVE";
  }
  if (data.name) {
    const [firstName, ...rest] = data.name.trim().split(" ");
    updateData.firstName = firstName;
    updateData.lastName = rest.join(" ") || null;
  }
  if (data.doctor !== undefined) {
    if (!data.doctor) {
      updateData.assignedDoctorId = null;
    } else {
      const [fn, ...ln] = data.doctor.trim().split(" ");
      const found = await prisma.user.findFirst({
        where: { role: "DOCTOR", firstName: fn, ...(ln.length ? { lastName: ln.join(" ") } : {}) },
      });
      updateData.assignedDoctorId = found ? found.id : null;
    }
  }

  const updated = await prisma.user.update({ where: { id }, data: updateData, include: doctorInclude });
  return toPatient(updated);
};

export const deletePatient = async (id: string) => {
  const user = await prisma.user.findFirst({ where: { id, role: "PATIENT" } });
  if (!user) throw new Error("Patient not found");
  return prisma.user.delete({ where: { id } });
};
