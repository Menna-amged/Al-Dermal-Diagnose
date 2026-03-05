/* register logic

login logic

checking existing email

password hashing

JWT generation*/ 

// src/modules/auth/auth.service.ts
import { prisma } from "../../config/prisma";
import { hashPassword, comparePassword } from "../../utils/hash";
import { generateToken } from "../../utils/jwt";
import { sendOTP, sendPasswordResetOTP } from "../../config/mailer";
import crypto from "crypto";

// Registration with OTP
export const registerUser = async (data: {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  gender?: string;
  age?: number;
  location?: string;
}) => {
  // Check if email exists
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    throw new Error("Email already exists");
  }

  // Hash password
  const hashedPassword = await hashPassword(data.password);

  // Generate OTP for email verification
  const otp = crypto.randomInt(100000, 999999).toString();

  // Create user in DB
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

  // Send OTP email
  await sendOTP(user.email, otp);

  return user;
};

// Login logic remains same
export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  const isValid = await comparePassword(password, user.password!);
  if (!isValid) throw new Error("Invalid credentials");

  if (!user.isVerified) throw new Error("Email not verified");

  const token = generateToken(user.id, user.role);
  return { user, token };
};

// OTP verification
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

// Check if email is already registered
export const checkEmail = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) throw new Error("This email is already registered");
  return { available: true };
};

// Verify reset OTP — marks as VERIFIED so resetPassword knows the OTP was confirmed
export const verifyResetOtp = async (email: string, otp: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("No account found with this email");
  if (user.passwordResetCode !== otp) throw new Error("Invalid or expired reset code");
  await prisma.user.update({ where: { email }, data: { passwordResetCode: "VERIFIED" } });
  return { valid: true };
};

// Resend registration OTP
export const resendOtp = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("No account found with this email");
  if (user.isVerified) throw new Error("Email already verified");

  const otp = crypto.randomInt(100000, 999999).toString();
  await prisma.user.update({ where: { email }, data: { verificationCode: otp } });
  await sendOTP(email, otp);
  return { message: "OTP resent" };
};

// Forgot password — send reset OTP
export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("No account found with this email");
  if (!user.isVerified) throw new Error("Account is not verified");

  const otp = crypto.randomInt(100000, 999999).toString();

  await prisma.user.update({
    where: { email },
    data: { passwordResetCode: otp },
  });

  await sendPasswordResetOTP(email, otp);

  return { message: "Password reset OTP sent to your email" };
};

// Reset password — OTP already verified at previous step, check history, update password
export const resetPassword = async (email: string, newPassword: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { passwordHistory: { orderBy: { changedAt: "desc" } } },
  });

  if (!user) throw new Error("No account found with this email");
  if (user.passwordResetCode !== "VERIFIED") throw new Error("OTP not verified");

  // Check against current password
  const isSameAsCurrent = await comparePassword(newPassword, user.password);
  if (isSameAsCurrent) {
    throw new Error("Enter another password");
  }

  // Check against password history
  for (const entry of user.passwordHistory) {
    const isReused = await comparePassword(newPassword, entry.password);
    if (isReused) {
      throw new Error("Enter another password");
    }
  }

  const hashedPassword = await hashPassword(newPassword);

  // Save current password to history before overwriting
  await prisma.passwordHistory.create({
    data: { userId: user.id, password: user.password },
  });

  // Update to new password and clear reset code
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword, passwordResetCode: null },
  });

  return { message: "Password reset successfully" };
};