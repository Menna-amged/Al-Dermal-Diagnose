/* register logic

login logic

checking existing email

password hashing

JWT generation*/ 

// src/modules/auth/auth.service.ts
import { prisma } from "../../config/prisma";
import { hashPassword, comparePassword } from "../../utils/hash";
import { generateToken } from "../../utils/jwt";
import { sendOTP } from "../../config/mailer";
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