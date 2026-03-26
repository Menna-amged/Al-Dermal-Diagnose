import { Request, Response } from "express";
import { upgradeToPremium, downgradeFromPremium } from "./users.service";
import { prisma } from "../../config/prisma";

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, email: true, firstName: true, role: true, isPremium: true },
    });
    if (!user) return res.status(401).json({ error: "User not found" });
    res.json(user);
  } catch (err: any) {
    res.status(401).json({ error: "Invalid token" });
  }
};

export const upgradeMe = async (req: Request, res: Response) => {
  try {
    const user = await upgradeToPremium(req.user!.userId);
    res.json({ message: "Upgraded to premium", user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const upgradeUser = async (req: Request, res: Response) => {
  try {
    const user = await upgradeToPremium(req.params.id as string);
    res.json({ message: "User upgraded to premium", user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const downgradeMe = async (req: Request, res: Response) => {
  try {
    const user = await downgradeFromPremium(req.user!.userId);
    res.json({ message: "Subscription cancelled", user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const downgradeUser = async (req: Request, res: Response) => {
  try {
    const user = await downgradeFromPremium(req.params.id as string);
    res.json({ message: "User downgraded from premium", user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
