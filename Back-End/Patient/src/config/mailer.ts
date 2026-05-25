import nodemailer from "nodemailer";
import "dotenv/config";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // your app password
  },
});

export const sendOTP = async (to: string, otp: string) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Your OTP for DermaAI Registration",
    html: `<p>Your OTP code is: <b>${otp}</b></p>`,
  });
};

export const sendPasswordResetOTP = async (to: string, otp: string) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "DermaAI Password Reset OTP",
    html: `<p>Your password reset code is: <b>${otp}</b>.</p><p>If you did not request this, please ignore this email.</p>`,
  });
};