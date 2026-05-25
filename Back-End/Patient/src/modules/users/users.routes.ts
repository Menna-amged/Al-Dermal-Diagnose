import { Router } from "express";
import { getDoctors, getDoctorRecentCases, getMe, upgradeMe, downgradeMe, upgradeUser, downgradeUser, savePushToken } from "./users.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";

const router = Router();

router.get("/doctors", authMiddleware, getDoctors);
router.get("/doctors/:userId/cases", authMiddleware, getDoctorRecentCases);
router.get("/me", authMiddleware, getMe);
router.patch("/me/push-token", authMiddleware, savePushToken);

// Any authenticated user can manage their own subscription
router.patch("/me/upgrade", authMiddleware, upgradeMe);
router.patch("/me/downgrade", authMiddleware, downgradeMe);

// Admin only
router.patch("/:id/upgrade", authMiddleware, requireRole("ADMIN"), upgradeUser);
router.patch("/:id/downgrade", authMiddleware, requireRole("ADMIN"), downgradeUser);

export default router;
