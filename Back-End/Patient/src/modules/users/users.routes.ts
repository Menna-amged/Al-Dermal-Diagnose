import { Router } from "express";
import { getDoctors, getDoctorRecentCases, getMe, updateMe, requestEmailChange, confirmEmailChange, addTokens, spendToken, upgradeMe, downgradeMe, upgradeUser, downgradeUser, savePushToken, changePassword } from "./users.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";

const router = Router();

router.get("/doctors", authMiddleware, getDoctors);
router.get("/doctors/:userId/cases", authMiddleware, getDoctorRecentCases);
router.get("/me", authMiddleware, getMe);
router.patch("/me", authMiddleware, updateMe);
router.post("/me/request-email-change", authMiddleware, requestEmailChange);
router.post("/me/confirm-email-change", authMiddleware, confirmEmailChange);
router.post("/me/tokens/add", authMiddleware, addTokens);
router.post("/me/tokens/spend", authMiddleware, spendToken);
router.patch("/me/push-token", authMiddleware, savePushToken);
router.post("/me/change-password", authMiddleware, changePassword);

// Any authenticated user can manage their own subscription
router.patch("/me/upgrade", authMiddleware, upgradeMe);
router.patch("/me/downgrade", authMiddleware, downgradeMe);

// Admin only
router.patch("/:id/upgrade", authMiddleware, requireRole("ADMIN"), upgradeUser);
router.patch("/:id/downgrade", authMiddleware, requireRole("ADMIN"), downgradeUser);

export default router;
