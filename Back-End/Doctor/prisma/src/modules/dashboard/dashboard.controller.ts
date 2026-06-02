import { Request, Response } from "express";
import { getDashboardStats } from "./dashboard.service";

export const getStats = async (req: Request, res: Response) => {
  try {
    const doctorId = req.user!.userId;
    const stats = await getDashboardStats(doctorId);
    res.json(stats);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
