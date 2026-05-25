import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";

export const requirePremium = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const patient = await prisma.patient.findUnique({ where: { userId: req.user.userId } });

  if (!patient?.isPremium) {
    res.status(403).json({ error: "Premium subscription required" });
    return;
  }

  next();
};
