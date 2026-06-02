import { Request, Response } from "express";
import { upgradeToPremium, downgradeFromPremium, isPremiumActive } from "./users.service";
import { prisma } from "../../config/prisma";
import { sendEmailChangeOTP } from "../../config/mailer";
import { comparePassword, hashPassword } from "../../utils/hash";
import crypto from "crypto";

const pendingEmailChanges = new Map<string, { newEmail: string; otp: string; expiresAt: number }>();

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

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: {
        patient: { select: { isPremium: true, premiumExpiresAt: true, tokens: true } },
        doctor: true,
      },
    });
    if (!user) return res.status(401).json({ error: "User not found" });

    if (user.role === "DOCTOR") {
      return res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        specialty: user.doctor?.specialty ?? null,
        bio: user.doctor?.bio ?? null,
        clinicName: user.doctor?.clinicName ?? null,
        rating: user.doctor?.rating ?? 0,
        isProfileComplete: user.doctor?.isProfileComplete ?? false,
      });
    }

    const active = user.patient ? isPremiumActive(user.patient) : false;
    if (user.patient?.isPremium && !active) {
      prisma.patient.update({
        where: { userId: req.user!.userId },
        data: { isPremium: false, premiumExpiresAt: null },
      }).catch(() => {});
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isPremium: active,
      premiumExpiresAt: user.patient?.premiumExpiresAt ?? null,
      tokens: user.patient?.tokens ?? 0,
    });
  } catch (err: any) {
    res.status(401).json({ error: "Invalid token" });
  }
};

export const updateMe = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName } = req.body;
    const updated = await prisma.user.update({
      where: { id: (req as any).user.userId },
      data: {
        ...(firstName !== undefined ? { firstName } : {}),
        ...(lastName  !== undefined ? { lastName  } : {}),
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
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
    const userId = (req as any).user.userId;
    const { newEmail } = req.body;
    if (!newEmail) return res.status(400).json({ error: "New email required" });

    const existing = await prisma.user.findUnique({ where: { email: newEmail } });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const otp = crypto.randomInt(100000, 999999).toString();
    pendingEmailChanges.set(userId, { newEmail, otp, expiresAt: Date.now() + 10 * 60 * 1000 });
    sendEmailChangeOTP(newEmail, otp).catch(() => {});
    res.json({ message: "OTP sent to new email" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const confirmEmailChange = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { otp } = req.body;

    const pending = pendingEmailChanges.get(userId);
    if (!pending) return res.status(400).json({ error: "No pending email change. Please request a new OTP." });
    if (Date.now() > pending.expiresAt) {
      pendingEmailChanges.delete(userId);
      return res.status(400).json({ error: "OTP expired. Please request a new one." });
    }
    if (pending.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });

    const existing = await prisma.user.findUnique({ where: { email: pending.newEmail } });
    if (existing) {
      pendingEmailChanges.delete(userId);
      return res.status(409).json({ error: "Email already registered" });
    }

    await prisma.user.update({ where: { id: userId }, data: { email: pending.newEmail } });
    pendingEmailChanges.delete(userId);
    res.json({ message: "Email updated successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const addTokens = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });
    const patient = await prisma.patient.findUnique({ where: { userId } });
    if (!patient) return res.status(403).json({ error: "Not a patient" });
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
    const patient = await prisma.patient.findUnique({ where: { userId } });
    if (!patient) return res.status(403).json({ error: "Not a patient" });
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

export const savePushToken = async (req: Request, res: Response) => {
  const { expoPushToken } = req.body;
  if (!expoPushToken) return res.status(400).json({ error: "Token required" });
  await prisma.user.update({ where: { id: (req as any).user.userId }, data: { expoPushToken } });
  res.json({ ok: true });
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

export const getDoctorRecentCases = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const doctor = await prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    const cases = await (prisma as any).case.findMany({
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
