import { Request, Response } from "express";
import { getProfile, updateProfile, changePassword, completeProfile } from "./profile.service";

export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const doctorId = req.user!.userId;
    const profile = await getProfile(doctorId);
    res.json(profile);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const updateMyProfile = async (req: Request, res: Response) => {
  try {
    const doctorId = req.user!.userId;
    const updated = await updateProfile(doctorId, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const completeMyProfile = async (req: Request, res: Response) => {
  try {
    const doctorId = req.user!.userId;
    const { firstName, lastName, phone, specialty, clinicName, bio } = req.body;
    if (!firstName || !phone || !specialty || !clinicName || !bio) {
      res.status(400).json({ error: "firstName, phone, specialty, clinicName, and bio are required" });
      return;
    }
    const result = await completeProfile(doctorId, { firstName, lastName, phone, specialty, clinicName, bio });
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const changeMyPassword = async (req: Request, res: Response) => {
  try {
    const doctorId = req.user!.userId;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "currentPassword and newPassword are required" });
      return;
    }
    const result = await changePassword(doctorId, currentPassword, newPassword);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
