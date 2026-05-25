import { Router } from "express";
import { getMyProfile, updateMyProfile, changeMyPassword, completeMyProfile } from "./profile.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";

const router = Router();

router.use(authMiddleware, requireRole("DOCTOR"));

router.get("/me", getMyProfile);
router.patch("/me", updateMyProfile);
router.patch("/me/complete", completeMyProfile);
router.patch("/me/password", changeMyPassword);

export default router;
