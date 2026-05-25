import { Router } from "express";
import {
  createConsultation, getConsultations, getConsultation,
  acceptConsultation, denyConsultation, closeConsultation,
  getMessages, sendMessage,
} from "./consultations.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/",               authMiddleware, createConsultation);
router.get("/",                authMiddleware, getConsultations);
router.get("/:id",             authMiddleware, getConsultation);
router.patch("/:id/accept",    authMiddleware, acceptConsultation);
router.patch("/:id/deny",      authMiddleware, denyConsultation);
router.patch("/:id/close",     authMiddleware, closeConsultation);
router.get("/:id/messages",    authMiddleware, getMessages);
router.post("/:id/messages",   authMiddleware, sendMessage);

export default router;
