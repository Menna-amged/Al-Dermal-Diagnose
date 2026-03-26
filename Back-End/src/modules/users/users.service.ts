import { prisma } from "../../config/prisma";

export const upgradeToPremium = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  return await prisma.user.update({
    where: { id: userId },
    data: { isPremium: true },
    select: { id: true, email: true, isPremium: true },
  });
};

export const downgradeFromPremium = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  return await prisma.user.update({
    where: { id: userId },
    data: { isPremium: false },
    select: { id: true, email: true, isPremium: true },
  });
};
