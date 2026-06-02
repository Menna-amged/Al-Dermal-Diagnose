import { Router } from "express";
import multer from "multer";
import path from "path";
import { createConsultation, getConsultations, getConsultation, acceptConsultation, denyConsultation, closeConsultation, getMessages, sendMessage, uploadSkinImage, submitFinalDiagnosis } from "./consultations.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(process.cwd(), "uploads/skins")),
  filename:    (_req, file,  cb) => cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const router = Router();

router.post("/upload-image",      authMiddleware, upload.single("image"), uploadSkinImage);
router.post("/",                  authMiddleware, createConsultation);
router.get("/",                   authMiddleware, getConsultations);
router.get("/:id",                authMiddleware, getConsultation);
router.patch("/:id/accept",       authMiddleware, acceptConsultation);
router.patch("/:id/deny",         authMiddleware, denyConsultation);
router.patch("/:id/close",        authMiddleware, closeConsultation);
router.get("/:id/messages",            authMiddleware, getMessages);
router.post("/:id/messages",           authMiddleware, sendMessage);
router.patch("/:id/final-diagnosis",   authMiddleware, submitFinalDiagnosis);

export default router;
