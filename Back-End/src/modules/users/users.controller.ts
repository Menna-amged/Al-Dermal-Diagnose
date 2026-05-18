import { Request, Response } from "express";
import { upgradeToPremium, downgradeFromPremium } from "./users.service";
import { prisma } from "../../config/prisma";

export const getDoctors = async (req: Request, res: Response) => {
  try {
    const { governorate, specialty } = req.query;

    const doctors = await prisma.doctor.findMany({
      where: {
        user: {
          isVerified: true,
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
    const { userId } = req.params;
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
      select: { id: true, email: true, firstName: true, role: true },
    });
    if (!user) return res.status(401).json({ error: "User not found" });

    const patient = await prisma.patient.findUnique({
      where: { userId: req.user!.userId },
      select: { isPremium: true },
    });

    res.json({ ...user, isPremium: patient?.isPremium ?? false });
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
