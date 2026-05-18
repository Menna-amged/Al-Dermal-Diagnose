import { Router } from "express";
import { listPatients, getPatient } from "./patients.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";

const router = Router();

router.use(authMiddleware, requireRole("DOCTOR"));

router.get("/", listPatients);
router.get("/:id", getPatient);

export default router;
