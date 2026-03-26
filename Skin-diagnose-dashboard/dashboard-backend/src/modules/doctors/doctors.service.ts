import { prisma } from "../../config/prisma";
import { hashPassword } from "../../utils/hash";
import crypto from "crypto";

const toDoctor = (u: any, casesCount = 0) => ({
  id: u.id,
  name: [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email,
  email: u.email,
  phone: u.phone || "",
  status: u.isBanned ? "BANNED" : u.isVerified ? "ACTIVE" : "INACTIVE",
  joinedAt: u.createdAt,
  avatar: ((u.firstName?.[0] || "") + (u.lastName?.[0] || "")).toUpperCase() || u.email[0].toUpperCase(),
  cases: casesCount,
});

export const getAllDoctors = async () => {
  const doctors = await prisma.user.findMany({
    where: { role: "DOCTOR" },
    include: { _count: { select: { doctorCases: true } } },
    orderBy: { createdAt: "desc" },
  });
  return doctors.map((d) => toDoctor(d, d._count.doctorCases));
};

export const createDoctor = async (data: {
  name: string; email: string; phone?: string;
}) => {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    if (existingUser.role === "PATIENT")
      throw new Error("This email is already registered as a patient");
    throw new Error("A doctor with this email already exists");
  }

  const [firstName, ...rest] = data.name.trim().split(" ");
  const lastName = rest.join(" ") || undefined;

  const tempPassword = await hashPassword(crypto.randomBytes(12).toString("hex"));

  return toDoctor(await prisma.user.create({
    data: {
      email: data.email,
      password: tempPassword,
      firstName,
      lastName,
      phone: data.phone,
      role: "DOCTOR",
      isVerified: true,
    },
  }));
};

export const updateDoctor = async (id: string, data: {
  name?: string; email?: string; phone?: string; status?: string;
}) => {
  const user = await prisma.user.findFirst({ where: { id, role: "DOCTOR" } });
  if (!user) throw new Error("Doctor not found");

  if (data.email && data.email !== user.email) {
    const conflict = await prisma.user.findUnique({ where: { email: data.email } });
    if (conflict) {
      if (conflict.role === "PATIENT")
        throw new Error("This email is already registered as a patient");
      throw new Error("A doctor with this email already exists");
    }
  }

  const updateData: any = {};
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.name) {
    const [firstName, ...rest] = data.name.trim().split(" ");
    updateData.firstName = firstName;
    updateData.lastName = rest.join(" ") || null;
  }
  if (data.status) {
    const s = data.status.toUpperCase();
    if (s === "BANNED")   updateData.isBanned = true;
    if (s === "ACTIVE")   { updateData.isBanned = false; updateData.isVerified = true; }
    if (s === "INACTIVE") { updateData.isBanned = false; updateData.isVerified = false; }
  }

  const updated = await prisma.user.update({ where: { id }, data: updateData });
  const count = await prisma.case.count({ where: { doctorId: id } });
  return toDoctor(updated, count);
};

export const deleteDoctor = async (id: string) => {
  const user = await prisma.user.findFirst({ where: { id, role: "DOCTOR" } });
  if (!user) throw new Error("Doctor not found");
  return prisma.user.delete({ where: { id } });
};

export const toggleBan = async (id: string) => {
  const user = await prisma.user.findFirst({ where: { id, role: "DOCTOR" } });
  if (!user) throw new Error("Doctor not found");
  const updated = await prisma.user.update({ where: { id }, data: { isBanned: !user.isBanned } });
  const count = await prisma.case.count({ where: { doctorId: id } });
  return toDoctor(updated, count);
};
