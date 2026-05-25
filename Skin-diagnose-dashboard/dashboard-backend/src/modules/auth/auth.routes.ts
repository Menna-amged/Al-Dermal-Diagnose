import { Router } from "express";
import { login, me, updateMe } from "./auth.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/login", login);
router.get("/me",   authMiddleware, me);
router.patch("/me", authMiddleware, updateMe);

export default router;
