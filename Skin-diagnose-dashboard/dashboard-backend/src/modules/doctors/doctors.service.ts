import { prisma } from "../../config/prisma";
import { hashPassword } from "../../utils/hash";

const toDoctor = (d: any, casesCount = 0) => ({
  id: d.user.id,
  name: [d.user.firstName, d.user.lastName].filter(Boolean).join(" ") || d.user.email,
  email: d.user.email,
  phone: d.user.phone || "",
  specialty: d.specialty || "",
  clinicName: d.clinicName || "",
  bio: d.bio || "",
  rating: d.rating,
  status: d.user.isBanned ? "BANNED" : d.user.isVerified ? "ACTIVE" : "INACTIVE",
  joinedAt: d.user.createdAt,
  avatar: ((d.user.firstName?.[0] || "") + (d.user.lastName?.[0] || "")).toUpperCase() || d.user.email[0].toUpperCase(),
  cases: casesCount,
});

export const getAllDoctors = async () => {
  const doctors = await prisma.doctor.findMany({
    include: {
      user: true,
      _count: { select: { cases: true } },
    },
    orderBy: { user: { createdAt: "desc" } },
  });
  return doctors.map((d) => toDoctor(d, d._count.cases));
};

export const createDoctor = async (data: {
  email: string; password: string;
}) => {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    if (existingUser.role === "PATIENT")
      throw new Error("This email is already registered as a patient");
    throw new Error("A doctor with this email already exists");
  }

  const hashed = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashed,
      role: "DOCTOR",
      isVerified: true,
    },
  });

  const doctor = await prisma.doctor.create({
    data: { userId: user.id },
    include: { user: true },
  });

  return toDoctor(doctor, 0);
};

export const updateDoctor = async (userId: string, data: {
  email?: string; password?: string;
}) => {
  const doctor = await prisma.doctor.findUnique({ where: { userId }, include: { user: true } });
  if (!doctor) throw new Error("Doctor not found");

  if (data.email && data.email !== doctor.user.email) {
    const conflict = await prisma.user.findUnique({ where: { email: data.email } });
    if (conflict) {
      if (conflict.role === "PATIENT") throw new Error("This email is already registered as a patient");
      throw new Error("A doctor with this email already exists");
    }
  }

  const userUpdateData: any = {};
  if (data.email !== undefined) userUpdateData.email = data.email;
  if (data.password) userUpdateData.password = await hashPassword(data.password);

  await prisma.user.update({ where: { id: userId }, data: userUpdateData });
  const updated = await prisma.doctor.findUnique({ where: { userId }, include: { user: true, _count: { select: { cases: true } } } });
  return toDoctor(updated!, updated!._count.cases);
};

export const deleteDoctor = async (userId: string) => {
  const doctor = await prisma.doctor.findUnique({ where: { userId } });
  if (!doctor) throw new Error("Doctor not found");
  await prisma.doctor.delete({ where: { userId } });
  return prisma.user.delete({ where: { id: userId } });
};

export const setDoctorPassword = async (userId: string, password: string) => {
  const doctor = await prisma.doctor.findUnique({ where: { userId } });
  if (!doctor) throw new Error("Doctor not found");
  const hashed = await hashPassword(password);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
  return { message: "Password updated successfully" };
};

export const toggleBan = async (userId: string) => {
  const doctor = await prisma.doctor.findUnique({ where: { userId }, include: { user: true } });
  if (!doctor) throw new Error("Doctor not found");
  const updated = await prisma.user.update({ where: { id: userId }, data: { isBanned: !doctor.user.isBanned } });
  const count = await prisma.case.count({ where: { doctorId: doctor.id } });
  return toDoctor({ ...doctor, user: updated }, count);
};
