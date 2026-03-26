import { Request, Response } from "express";
import { loginAdmin } from "./auth.service";
import { prisma } from "../../config/prisma";

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
