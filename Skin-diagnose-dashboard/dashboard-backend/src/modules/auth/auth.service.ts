import { prisma } from "../../config/prisma";
import { comparePassword, hashPassword } from "../../utils/hash";
import { generateToken } from "../../utils/jwt";

export const loginAdmin = async (email: string, password: string) => {
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) throw new Error("Invalid credentials");

  const isValid = await comparePassword(password, admin.password);
  if (!isValid) throw new Error("Invalid credentials");

  const token = generateToken(admin.id, admin.role);
  return { token, admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role, avatar: admin.avatar } };
};

export const seedAdmin = async () => {
  const existing = await prisma.admin.findUnique({ where: { email: "admin@dermacam.com" } });
  if (existing) return;
  const hashed = await hashPassword("admin");
  await prisma.admin.create({
    data: { email: "admin@dermacam.com", password: hashed, name: "Admin", avatar: "AD" },
  });
  console.log("Default admin seeded: admin@dermacam.com / admin");
};
