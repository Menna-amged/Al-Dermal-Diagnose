import { prisma } from "../../config/prisma";
import { hashPassword, comparePassword } from "../../utils/hash";
import { generateToken } from "../../utils/jwt";
import { sendOTP, sendPasswordResetOTP } from "../../config/mailer";
import crypto from "crypto";

export const registerUser = async (data: {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  gender?: string;
  age?: number;
  location?: string;
}) => {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) throw new Error("Email already exists");

  const hashedPassword = await hashPassword(data.password);
  const otp = crypto.randomInt(100000, 999999).toString();

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      gender: data.gender,
      age: data.age,
      location: data.location,
      verificationCode: otp,
      isVerified: false,
    },
  });

  await prisma.patient.create({ data: { userId: user.id } });
  await sendOTP(user.email, otp);
  return user;
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { patient: true },
  });
  if (!user) throw new Error("User not found");

  if (user.role !== "PATIENT") throw new Error("This email is registered as a doctor. Please use the doctor login.");

  const isValid = await comparePassword(password, user.password!);
  if (!isValid) throw new Error("Invalid credentials");

  if (!user.isVerified) throw new Error("Email not verified");
  if (user.isBanned) throw new Error("Your account has been suspended");

  const token = generateToken(user.id, user.role);
  return { user, token };
};

export const verifyOTP = async (email: string, otp: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");
  if (user.isVerified) throw new Error("Email already verified");
  if (user.verificationCode !== otp) throw new Error("Invalid OTP");

  await prisma.user.update({
    where: { email },
    data: { isVerified: true, verificationCode: null },
  });

  return { message: "Email verified successfully" };
};

export const checkEmail = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) throw new Error("This email is already registered");
  return { available: true };
};

export const verifyResetOtp = async (email: string, otp: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("No account found with this email");
  if (user.passwordResetCode !== otp) throw new Error("Invalid or expired reset code");
  await prisma.user.update({ where: { email }, data: { passwordResetCode: "VERIFIED" } });
  return { valid: true };
};

export const resendOtp = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("No account found with this email");
  if (user.isVerified) throw new Error("Email already verified");

  const otp = crypto.randomInt(100000, 999999).toString();
  await prisma.user.update({ where: { email }, data: { verificationCode: otp } });
  await sendOTP(email, otp);
  return { message: "OTP resent" };
};

export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("No account found with this email");
  if (!user.isVerified) throw new Error("Account is not verified");

  const otp = crypto.randomInt(100000, 999999).toString();
  await prisma.user.update({ where: { email }, data: { passwordResetCode: otp } });
  await sendPasswordResetOTP(email, otp);
  return { message: "Password reset OTP sent to your email" };
};

export const resetPassword = async (email: string, newPassword: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { passwordHistory: { orderBy: { changedAt: "desc" } } },
  });

  if (!user) throw new Error("No account found with this email");
  if (user.passwordResetCode !== "VERIFIED") throw new Error("OTP not verified");

  const isSameAsCurrent = await comparePassword(newPassword, user.password);
  if (isSameAsCurrent) throw new Error("Enter another password");

  for (const entry of user.passwordHistory) {
    const isReused = await comparePassword(newPassword, entry.password);
    if (isReused) throw new Error("Enter another password");
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.passwordHistory.create({
    data: { userId: user.id, password: user.password },
  });

  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword, passwordResetCode: null },
  });

  return { message: "Password reset successfully" };
};
