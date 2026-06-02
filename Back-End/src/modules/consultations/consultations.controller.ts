import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { sendPushNotification } from "../../utils/notifications";

export const uploadSkinImage = (req: Request, res: Response) => {
  const file = (req as any).file;
  if (!file) return res.status(400).json({ message: "No file uploaded" });
  const host = `${req.protocol}://${req.get("host")}`;
  res.json({ url: `${host}/uploads/skins/${file.filename}` });
};

const CHAT_TTL_MS   = 3 * 24 * 60 * 60 * 1000; // 3 days auto-expiry

function isExpired(acceptedAt: Date | null): boolean {
  if (!acceptedAt) return false;
  return Date.now() - new Date(acceptedAt).getTime() > CHAT_TTL_MS;
}

function confidenceToRisk(conf: number): "LOW" | "MEDIUM" | "HIGH" {
  if (conf >= 80) return "HIGH";
  if (conf >= 60) return "MEDIUM";
  return "LOW";
}

function createAlert(doctorId: string, title: string, message: string, type: "INFO" | "WARNING" | "URGENT" = "INFO") {
  return (prisma as any).alert.create({ data: { id: require("crypto").randomUUID(), doctorId, title, message, type } }).catch(() => {});
}

export const createConsultation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { doctorId, disease, confidence, skinImageUrl, isDiagnosisOnly } = req.body;

    if (!doctorId || !disease) {
      return res.status(400).json({ message: "doctorId and disease are required" });
    }

    const patient = await prisma.patient.findUnique({ where: { userId } });
    if (!patient) return res.status(403).json({ message: "Not a patient" });

    const doctor = await prisma.doctor.findUnique({ where: { userId: doctorId } });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const consultation = await prisma.consultation.create({
      data: { patientId: patient.id, doctorId: doctor.id, disease, confidence: confidence ?? 0, skinImageUrl: skinImageUrl ?? null, isDiagnosisOnly: isDiagnosisOnly === true },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      },
    });

    // ── Non-fatal side-effects ──────────────────────────────────────────
    const conf        = confidence ?? 0;
    const patientName = [consultation.patient.user.firstName, consultation.patient.user.lastName].filter(Boolean).join(" ") || "Unknown Patient";
    const doctorName  = `Dr. ${[consultation.doctor.user.firstName, consultation.doctor.user.lastName].filter(Boolean).join(" ")}`;

    (prisma as any).case.create({
      data: {
        patientName, doctorName,
        patientId: patient.id, doctorId: doctor.id,
        condition: disease, risk: confidenceToRisk(conf), confidence: conf, status: "PENDING",
        skinImageUrl: skinImageUrl ?? null,
      },
    }).catch(() => {});

    prisma.patient.update({ where: { id: patient.id }, data: { lastVisit: new Date(), assignedDoctorId: doctor.id } }).catch(() => {});

    createAlert(doctor.id, "New Consultation Request", `${patientName} is requesting a consultation about ${disease}.`, "URGENT");

    prisma.user.findUnique({ where: { id: doctorId } }).then((doctorUser) => {
      sendPushNotification(
        doctorUser?.expoPushToken,
        "New Consultation Request",
        `${patientName} is requesting your consultation about ${disease}`,
        { consultationId: consultation.id, screen: "DoctorChat" }
      );
    }).catch(() => {});
    // ───────────────────────────────────────────────────────────────────

    res.json(consultation);
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? "Failed to create consultation" });
  }
};

export const getConsultations = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const role   = (req as any).user.role;

  if (role === "PATIENT") {
    const patient = await prisma.patient.findUnique({ where: { userId } });
    if (!patient) return res.json([]);
    const list = await prisma.consultation.findMany({
      where: { patientId: patient.id },
      include: {
        doctor: { include: { user: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json(list);
  }

  if (role === "DOCTOR") {
    const doctor = await prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) return res.json([]);
    const list = await prisma.consultation.findMany({
      where: { doctorId: doctor.id },
      include: {
        patient: { include: { user: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json(list);
  }

  res.json([]);
};

export const getConsultation = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const consultation = await prisma.consultation.findUnique({
    where: { id },
    include: {
      doctor: { include: { user: true } },
      patient: { include: { user: true } },
    },
  });
  if (!consultation) return res.status(404).json({ message: "Not found" });
  res.json(consultation);
};

export const acceptConsultation = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = (req as any).user.userId;

    const doctor = await prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) return res.status(403).json({ message: "Not a doctor" });

    const consultation = await prisma.consultation.findUnique({ where: { id } });
    if (!consultation) return res.status(404).json({ message: "Not found" });
    if (consultation.doctorId !== doctor.id) return res.status(403).json({ message: "Forbidden" });

    const updated = await prisma.consultation.update({
      where: { id },
      data: { status: "OPEN", acceptedAt: new Date() },
      include: { doctor: { include: { user: true } }, patient: { include: { user: true } } },
    });

    // Non-fatal side-effects
    (prisma as any).case.findFirst({
      where: { patientId: consultation.patientId, doctorId: doctor.id, condition: consultation.disease, status: "PENDING" },
      orderBy: { date: "desc" },
    }).then((pendingCase: any) => {
      if (pendingCase) {
        (prisma as any).case.update({ where: { id: pendingCase.id }, data: { status: "DIAGNOSED" } }).catch(() => {});
      }
    }).catch(() => {});

    const doctorName = `Dr. ${[updated.doctor.user.firstName, updated.doctor.user.lastName].filter(Boolean).join(" ")}`;
    prisma.user.findUnique({ where: { id: updated.patient.userId } }).then((patientUser) => {
      sendPushNotification(
        patientUser?.expoPushToken,
        "Consultation Accepted",
        `${doctorName} has accepted your consultation. You can now chat!`,
        { consultationId: id, screen: "Chat" }
      );
    }).catch(() => {});

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? "Failed to accept consultation" });
  }
};

export const denyConsultation = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = (req as any).user.userId;
    const { reason } = req.body;

    const doctor = await prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) return res.status(403).json({ message: "Not a doctor" });

    const consultation = await prisma.consultation.findUnique({
      where: { id },
      include: { doctor: { include: { user: true } }, patient: { include: { user: true } } },
    });
    if (!consultation) return res.status(404).json({ message: "Not found" });
    if (consultation.doctorId !== doctor.id) return res.status(403).json({ message: "Forbidden" });

    const updated = await prisma.consultation.update({
      where: { id },
      data: { status: "CLOSED", denyReason: reason ?? null },
    });

    // Refund as a limited (diagnosis-only) token
    prisma.patient.update({
      where: { id: consultation.patientId },
      data: { limitedTokens: { increment: 1 } },
    }).catch(() => {});

    // Non-fatal side-effects
    (prisma as any).case.findFirst({
      where: { patientId: consultation.patientId, doctorId: doctor.id, condition: consultation.disease, status: "PENDING" },
      orderBy: { date: "desc" },
    }).then((pendingCase: any) => {
      if (pendingCase) {
        (prisma as any).case.update({ where: { id: pendingCase.id }, data: { status: "CLOSED" } }).catch(() => {});
      }
    }).catch(() => {});

    const doctorName = `Dr. ${[consultation.doctor.user.firstName, consultation.doctor.user.lastName].filter(Boolean).join(" ")}`;
    prisma.user.findUnique({ where: { id: consultation.patient.userId } }).then((patientUser) => {
      sendPushNotification(
        patientUser?.expoPushToken,
        "Consultation Declined",
        `${doctorName} has declined your request. A diagnosis-only token has been refunded — use it to request a direct diagnosis from another doctor.`,
        { consultationId: id, screen: "MyConsultations" }
      );
    }).catch(() => {});

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? "Failed to deny consultation" });
  }
};

export const closeConsultation = async (req: Request, res: Response) => {
  try {
    const id     = req.params.id as string;
    const userId = (req as any).user.userId;

    const doctor = await prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) return res.status(403).json({ message: "Not a doctor" });

    const consultation = await prisma.consultation.findUnique({
      where: { id },
      include: { doctor: { include: { user: true } }, patient: { include: { user: true } } },
    });
    if (!consultation) return res.status(404).json({ message: "Not found" });
    if (consultation.doctorId !== doctor.id) return res.status(403).json({ message: "Forbidden" });
    if (consultation.status !== "OPEN") return res.status(400).json({ message: "Not open" });

    await prisma.consultation.update({ where: { id }, data: { status: "CLOSED" } });

    // Non-fatal side-effects
    (prisma as any).case.findFirst({
      where: { patientId: consultation.patientId, doctorId: doctor.id, condition: consultation.disease, status: "DIAGNOSED" },
      orderBy: { date: "desc" },
    }).then((diagnosedCase: any) => {
      if (diagnosedCase) {
        (prisma as any).case.update({ where: { id: diagnosedCase.id }, data: { status: "CLOSED" } }).catch(() => {});
      }
    }).catch(() => {});

    const doctorName = `Dr. ${[consultation.doctor.user.firstName, consultation.doctor.user.lastName].filter(Boolean).join(" ")}`;
    prisma.user.findUnique({ where: { id: consultation.patient.userId } }).then((patientUser) => {
      sendPushNotification(
        patientUser?.expoPushToken,
        "Consultation Closed",
        `${doctorName} has closed the consultation chat.`,
        { consultationId: id, screen: "MyConsultations" }
      );
    }).catch(() => {});

    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? "Failed to close consultation" });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const consultation = await prisma.consultation.findUnique({ where: { id } });
    if (!consultation) return res.status(404).json({ message: "Not found" });

    if (consultation.status === "PENDING") {
      return res.status(403).json({ message: "PENDING" });
    }
    if (consultation.status === "CLOSED" || isExpired(consultation.acceptedAt)) {
      return res.status(403).json({ message: "EXPIRED" });
    }

    const messages = await prisma.message.findMany({
      where: { consultationId: id },
      orderBy: { createdAt: "asc" },
    });
    res.json(messages);
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? "Failed to get messages" });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const id       = req.params.id as string;
    const userId   = (req as any).user.userId;
    const role     = (req as any).user.role;
    const { text } = req.body;

    if (!text?.trim()) return res.status(400).json({ message: "Message cannot be empty" });

    const consultation = await prisma.consultation.findUnique({ where: { id } });
    if (!consultation) return res.status(404).json({ message: "Not found" });
    if (consultation.status === "PENDING") return res.status(403).json({ message: "PENDING" });
    if (consultation.status === "CLOSED" || isExpired(consultation.acceptedAt)) {
      return res.status(403).json({ message: "EXPIRED" });
    }

    const message = await prisma.message.create({
      data: { consultationId: id, senderId: userId, senderRole: role, text: text.trim() },
    });

    // Alert the doctor when a patient sends a message
    if (role === "PATIENT") {
      const fullConsultation = await prisma.consultation.findUnique({
        where: { id },
        include: { patient: { include: { user: true } } },
      });
      if (fullConsultation) {
        const pName = [fullConsultation.patient.user.firstName, fullConsultation.patient.user.lastName].filter(Boolean).join(" ") || "A patient";
        createAlert(fullConsultation.doctorId, "New Message", `${pName} sent you a message about ${fullConsultation.disease}.`, "INFO");
      }
    }

    res.json(message);
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? "Failed to send message" });
  }
};

export const submitFinalDiagnosis = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId, role } = (req as any).user;
    if (role !== "DOCTOR") return res.status(403).json({ message: "Doctors only" });

    const { isAICorrect, finalDisease, doctorNotes } = req.body;

    const consultation = await prisma.consultation.findUnique({ where: { id } });
    if (!consultation) return res.status(404).json({ message: "Not found" });

    const doctor = await prisma.doctor.findUnique({ where: { userId } });
    if (!doctor || consultation.doctorId !== doctor.id)
      return res.status(403).json({ message: "Not your consultation" });

    const updated = await prisma.consultation.update({
      where: { id },
      data: {
        isAICorrect: isAICorrect ?? null,
        finalDisease: finalDisease ?? null,
        doctorNotes: doctorNotes ?? null,
        ...(consultation.isDiagnosisOnly ? { status: "CLOSED" } : {}),
      },
      include: { patient: { include: { user: true } }, doctor: { include: { user: true } } },
    });

    // Notify patient that the diagnosis is ready (diagnosis-only flow)
    if (consultation.isDiagnosisOnly) {
      const dName = `Dr. ${[updated.doctor.user.firstName, updated.doctor.user.lastName].filter(Boolean).join(" ")}`;
      sendPushNotification(
        updated.patient.user.expoPushToken,
        "Doctor's Diagnosis Ready",
        `${dName} has reviewed your case and submitted a diagnosis. Tap to view.`,
        { consultationId: id, screen: "MyConsultations" }
      );
    }

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? "Failed to submit" });
  }
};
