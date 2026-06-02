import { prisma } from "../../config/prisma";
import { hashPassword, comparePassword } from "../../utils/hash";

const getDoctorByUserId = async (userId: string) => {
  const doctor = await prisma.doctor.findUnique({ where: { userId }, include: { user: true } });
  if (!doctor) throw new Error("Doctor profile not found");
  return doctor;
};

export const getProfile = async (userId: string) => {
  const doctor = await getDoctorByUserId(userId);
  return {
    id: doctor.userId,
    email: doctor.user.email,
    firstName: doctor.user.firstName,
    lastName: doctor.user.lastName,
    phone: doctor.user.phone,
    gender: doctor.user.gender,
    age: doctor.user.age,
    location: doctor.user.location,
    role: doctor.user.role,
    createdAt: doctor.user.createdAt,
    specialty: doctor.specialty,
    bio: doctor.bio,
    clinicName: doctor.clinicName,
    rating: doctor.rating,
    isProfileComplete: doctor.isProfileComplete,
  };
};

export const updateProfile = async (
  userId: string,
  data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    gender?: string;
    age?: number;
    location?: string;
    specialty?: string;
    bio?: string;
    clinicName?: string;
  }
) => {
  const { specialty, bio, clinicName, ...userFields } = data;

  const [updatedUser, updatedDoctor] = await Promise.all([
    Object.keys(userFields).length > 0
      ? prisma.user.update({ where: { id: userId }, data: userFields })
      : prisma.user.findUnique({ where: { id: userId } }),
    (specialty !== undefined || bio !== undefined || clinicName !== undefined)
      ? prisma.doctor.update({ where: { userId }, data: { specialty, bio, clinicName } })
      : prisma.doctor.findUnique({ where: { userId } }),
  ]);

  return {
    id: userId,
    email: updatedUser!.email,
    firstName: updatedUser!.firstName,
    lastName: updatedUser!.lastName,
    phone: updatedUser!.phone,
    gender: updatedUser!.gender,
    age: updatedUser!.age,
    location: updatedUser!.location,
    specialty: updatedDoctor!.specialty,
    bio: updatedDoctor!.bio,
    clinicName: updatedDoctor!.clinicName,
  };
};

export const completeProfile = async (
  userId: string,
  data: {
    firstName: string;
    lastName?: string;
    phone: string;
    specialty: string;
    clinicName: string;
    bio: string;
  }
) => {
  const { firstName, lastName, phone, specialty, clinicName, bio } = data;

  await Promise.all([
    prisma.user.update({ where: { id: userId }, data: { firstName, lastName, phone } }),
    prisma.doctor.update({ where: { userId }, data: { specialty, clinicName, bio, isProfileComplete: true } }),
  ]);

  return { isProfileComplete: true };
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { passwordHistory: { orderBy: { changedAt: "desc" } } },
  });
  if (!user) throw new Error("Doctor not found");

  const isValid = await comparePassword(currentPassword, user.password);
  if (!isValid) throw new Error("Current password is incorrect");

  const isSameAsCurrent = await comparePassword(newPassword, user.password);
  if (isSameAsCurrent) throw new Error("New password must differ from current password");

  for (const entry of user.passwordHistory) {
    const isReused = await comparePassword(newPassword, entry.password);
    if (isReused) throw new Error("Enter another password");
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.passwordHistory.create({
    data: { userId, password: user.password },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { message: "Password changed successfully" };
};
