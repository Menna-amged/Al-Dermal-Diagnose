import { prisma } from "../../config/prisma";

const PREMIUM_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export function isPremiumActive(patient: { isPremium: boolean; premiumExpiresAt: Date | null }): boolean {
  if (!patient.isPremium) return false;
  if (!patient.premiumExpiresAt) return false;
  return new Date(patient.premiumExpiresAt).getTime() > Date.now();
}

export const upgradeToPremium = async (userId: string) => {
  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) throw new Error("Patient not found");
  const expiresAt = new Date(Date.now() + PREMIUM_DURATION_MS);
  const updated = await prisma.patient.update({
    where: { userId },
    data: { isPremium: true, premiumExpiresAt: expiresAt },
    select: { userId: true, isPremium: true, premiumExpiresAt: true },
  });
  return { id: updated.userId, isPremium: updated.isPremium, premiumExpiresAt: updated.premiumExpiresAt };
};

export const downgradeFromPremium = async (userId: string) => {
  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) throw new Error("Patient not found");
  const updated = await prisma.patient.update({
    where: { userId },
    data: { isPremium: false, premiumExpiresAt: null },
    select: { userId: true, isPremium: true },
  });
  return { id: updated.userId, isPremium: updated.isPremium };
};
