import { Request, Response } from "express";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "./auth.validation";
import { registerUser, loginUser, verifyOTP as verifyOTPService, forgotPassword as forgotPasswordService, resetPassword as resetPasswordService, checkEmail as checkEmailService, verifyResetOtp as verifyResetOtpService, resendOtp as resendOtpService } from "./auth.service";

export const register = async (req: Request, res: Response) => {
  try {
    const validated = registerSchema.parse(req.body);
    const user = await registerUser(validated);
    res.status(201).json({ message: "User registered. OTP sent to email.", userId: user.id });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validated = loginSchema.parse(req.body);
    const { user, token } = await loginUser(validated.email, validated.password);
    res.json({ message: "Login successful", token, isPremium: user.isPremium });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    const result = await verifyOTPService(email, otp);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const checkEmail = async (req: Request, res: Response) => {
  try {
    const result = await checkEmailService(req.body.email);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const verifyResetOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    const result = await verifyResetOtpService(email, otp);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const resendOtp = async (req: Request, res: Response) => {
  try {
    const result = await resendOtpService(req.body.email);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    const result = await forgotPasswordService(email);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = resetPasswordSchema.parse(req.body);
    const result = await resetPasswordService(email, newPassword);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
