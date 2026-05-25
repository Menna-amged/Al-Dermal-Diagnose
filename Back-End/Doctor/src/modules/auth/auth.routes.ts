import { Router } from "express";
import {
  register, login, verifyOTP, resendOtp, checkEmail,
  forgotPassword, verifyResetOtp, resetPassword,
} from "./auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOtp);
router.post("/check-email", checkEmail);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

export default router;
