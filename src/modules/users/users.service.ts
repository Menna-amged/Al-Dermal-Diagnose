import { prisma } from "../../config/prisma";

export const upgradeToPremium = async (userId: string) => {
  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) throw new Error("Patient not found");
  const updated = await prisma.patient.update({
    where: { userId },
    data: { isPremium: true },
    select: { userId: true, isPremium: true },
  });
  return { id: updated.userId, isPremium: updated.isPremium };
};

export const downgradeFromPremium = async (userId: string) => {
  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) throw new Error("Patient not found");
  const updated = await prisma.patient.update({
    where: { userId },
    data: { isPremium: false },
    select: { userId: true, isPremium: true },
  });
  return { id: updated.userId, isPremium: updated.isPremium };
};
