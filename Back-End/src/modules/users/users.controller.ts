import { Request, Response } from "express";
import { upgradeToPremium, downgradeFromPremium } from "./users.service";

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
