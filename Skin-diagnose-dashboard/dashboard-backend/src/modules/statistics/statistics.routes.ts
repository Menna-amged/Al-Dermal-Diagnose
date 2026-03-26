import { Router } from "express";
import { getStats } from "./statistics.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, getStats);

export default router;
