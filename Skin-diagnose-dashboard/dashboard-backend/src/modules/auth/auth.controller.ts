import { Request, Response } from "express";
import { loginAdmin } from "./auth.service";
import { prisma } from "../../config/prisma";
import { hashPassword, comparePassword } from "../../utils/hash";

export const me = async (req: Request, res: Response) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, name: true, email: true, role: true, avatar: true },
    });
    if (!admin) { res.status(404).json({ error: "Not found" }); return; }
    res.json(admin);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateMe = async (req: Request, res: Response) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const adminId = req.user!.userId;

    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) { res.status(404).json({ error: "Not found" }); return; }

    const updateData: any = {};
    if (name?.trim())  updateData.name  = name.trim();
    if (email?.trim()) updateData.email = email.trim().toLowerCase();

    if (newPassword) {
      if (newPassword.length < 8) { res.status(400).json({ error: "Password must be at least 8 characters" }); return; }
      if (!currentPassword) { res.status(400).json({ error: "Current password is required" }); return; }
      const valid = await comparePassword(currentPassword, admin.password);
      if (!valid) { res.status(400).json({ error: "Current password is incorrect" }); return; }
      updateData.password = await hashPassword(newPassword);
    }

    const updated = await prisma.admin.update({
      where: { id: adminId },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, avatar: true },
    });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }
    const result = await loginAdmin(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
};
