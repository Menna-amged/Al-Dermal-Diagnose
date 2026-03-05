import { Router } from "express";
import { upgradeMe, downgradeMe, upgradeUser, downgradeUser } from "./users.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";

const router = Router();

// Any authenticated user can manage their own subscription
router.patch("/me/upgrade", authMiddleware, upgradeMe);
router.patch("/me/downgrade", authMiddleware, downgradeMe);

// Admin only
router.patch("/:id/upgrade", authMiddleware, requireRole("ADMIN"), upgradeUser);
router.patch("/:id/downgrade", authMiddleware, requireRole("ADMIN"), downgradeUser);

export default router;
