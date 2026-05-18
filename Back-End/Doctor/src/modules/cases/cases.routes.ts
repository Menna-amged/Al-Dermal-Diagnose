import { Router } from "express";
import { listCases, getCase, diagnoseCase } from "./cases.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";

const router = Router();

router.use(authMiddleware, requireRole("DOCTOR"));

router.get("/", listCases);
router.get("/:id", getCase);
router.patch("/:id/diagnose", diagnoseCase);

export default router;
