import { Router } from "express";
import { getStats } from "./dashboard.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";

const router = Router();

router.get("/", authMiddleware, requireRole("DOCTOR"), getStats);

export default router;
