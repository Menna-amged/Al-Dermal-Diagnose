import { Request, Response } from "express";
import { upgradeToPremium, downgradeFromPremium } from "./users.service";
import { prisma } from "../../config/prisma";
import { sendEmailChangeOTP } from "../../config/mailer";
import { comparePassword, hashPassword } from "../../utils/hash";
import crypto from "crypto";

// In-memory store for pending email changes: userId -> { pendingEmail, otp, expiresAt }
const emailChangePending = new Map<string, { pendingEmail: string; otp: string; expiresAt: number }>();

export const getDoctors = async (req: Request, res: Response) => {
  try {
    const { governorate, specialty } = req.query;

    const doctors = await prisma.doctor.findMany({
      where: {
        isProfileComplete: true,
        user: {
          isBanned: false,
          ...(governorate ? { location: { contains: governorate as string, mode: "insensitive" } } : {}),
        },
        ...(specialty ? { specialty: { contains: specialty as string, mode: "insensitive" } } : {}),
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true, location: true },
        },
        _count: { select: { cases: true } },
      },
      orderBy: { rating: "desc" },
    });

    const result = doctors.map((d) => ({
      id:        d.userId,
      name:      `Dr. ${[d.user.firstName, d.user.lastName].filter(Boolean).join(" ")}`,
      email:     d.user.email,
      phone:     d.user.phone ?? "",
      location:  d.user.location ?? "",
      specialty: d.specialty ?? "",
      clinicName: d.clinicName ?? "",
      bio:       d.bio ?? "",
      rating:    d.rating,
      cases:     d._count.cases,
    }));

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getDoctorRecentCases = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const doctor = await prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    const cases = await prisma.case.findMany({
      where: { doctorId: doctor.id },
      select: { condition: true, date: true, risk: true, status: true },
      orderBy: { date: "desc" },
      take: 5,
    });
    res.json(cases);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });
    if (!user) return res.status(401).json({ error: "User not found" });

    const patient = await prisma.patient.findUnique({
      where: { userId: req.user!.userId },
      select: { isPremium: true, tokens: true, limitedTokens: true },
    });

    res.json({ ...user, isPremium: patient?.isPremium ?? false, tokens: patient?.tokens ?? 0, limitedTokens: patient?.limitedTokens ?? 0 });
  } catch (err: any) {
    res.status(401).json({ error: "Invalid token" });
  }
};

export const updateMe = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        ...(firstName !== undefined ? { firstName: String(firstName).trim() } : {}),
        ...(lastName  !== undefined ? { lastName:  String(lastName).trim()  } : {}),
      },
      select: { id: true, email: true, firstName: true, lastName: true },
    });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
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

export const requestEmailChange = async (req: Request, res: Response) => {
  try {
    const { newEmail } = req.body;
    if (!newEmail || typeof newEmail !== "string") {
      return res.status(400).json({ error: "New email is required" });
    }
    const trimmed = newEmail.trim().toLowerCase();

    // Check if already taken
    const existing = await prisma.user.findUnique({ where: { email: trimmed } });
    if (existing) return res.status(409).json({ error: "This email is already registered." });

    const otp = crypto.randomInt(100000, 999999).toString();
    emailChangePending.set(req.user!.userId, {
      pendingEmail: trimmed,
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    await sendEmailChangeOTP(trimmed, otp);
    res.json({ message: "OTP sent to new email." });
  } catch (err: any) {
    res.status(500).json({ error: "Could not send OTP. Please try again." });
  }
};

export const confirmEmailChange = async (req: Request, res: Response) => {
  try {
    const { otp } = req.body;
    const pending = emailChangePending.get(req.user!.userId);

    if (!pending) return res.status(400).json({ error: "No pending email change. Please request a new OTP." });
    if (Date.now() > pending.expiresAt) {
      emailChangePending.delete(req.user!.userId);
      return res.status(400).json({ error: "OTP has expired. Please request a new one." });
    }
    if (pending.otp !== String(otp).trim()) {
      return res.status(400).json({ error: "Invalid OTP. Please try again." });
    }

    // Final duplicate check before writing
    const existing = await prisma.user.findUnique({ where: { email: pending.pendingEmail } });
    if (existing) {
      emailChangePending.delete(req.user!.userId);
      return res.status(409).json({ error: "This email was just taken. Please use a different one." });
    }

    await prisma.user.update({
      where: { id: req.user!.userId },
      data:  { email: pending.pendingEmail },
    });

    emailChangePending.delete(req.user!.userId);
    res.json({ message: "Email updated successfully." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const savePushToken = async (req: Request, res: Response) => {
  const { expoPushToken } = req.body;
  if (!expoPushToken) return res.status(400).json({ error: "Token required" });
  await prisma.user.update({ where: { id: (req as any).user.userId }, data: { expoPushToken } });
  res.json({ ok: true });
};

export const addTokens = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });
    await prisma.patient.upsert({ where: { userId }, create: { userId }, update: {} });
    const updated = await prisma.patient.update({
      where: { userId },
      data: { tokens: { increment: amount } },
      select: { tokens: true },
    });
    res.json({ tokens: updated.tokens });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const spendToken = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const patient = await prisma.patient.upsert({ where: { userId }, create: { userId }, update: {} });
    if (patient.tokens < 1) return res.status(400).json({ error: "Not enough tokens" });
    const updated = await prisma.patient.update({
      where: { userId },
      data: { tokens: { decrement: 1 } },
      select: { tokens: true },
    });
    res.json({ tokens: updated.tokens });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const spendLimitedToken = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const patient = await prisma.patient.upsert({ where: { userId }, create: { userId }, update: {} });
    if (patient.limitedTokens < 1) return res.status(400).json({ error: "No diagnosis tokens available" });
    const updated = await prisma.patient.update({
      where: { userId },
      data: { limitedTokens: { decrement: 1 } },
      select: { limitedTokens: true },
    });
    res.json({ limitedTokens: updated.limitedTokens });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: "Current and new password are required." });

    const user = await prisma.user.findUnique({ where: { id: (req as any).user.userId } });
    if (!user) return res.status(404).json({ error: "User not found." });

    const isMatch = await comparePassword(currentPassword, user.password!);
    if (!isMatch) return res.status(401).json({ error: "Current password is incorrect." });

    if (currentPassword === newPassword)
      return res.status(400).json({ error: "New password must be different from your current password." });

    const hashed = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

    res.json({ message: "Password changed successfully." });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Failed to change password." });
  }
};
