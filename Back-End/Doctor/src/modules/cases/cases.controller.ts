import { Request, Response } from "express";
import { getDoctorCases, getCaseById, submitFinalDiagnosis } from "./cases.service";

export const listCases = async (req: Request, res: Response) => {
  try {
    const doctorId = req.user!.userId;
    const { status } = req.query;
    const cases = await getDoctorCases(doctorId, status as string | undefined);
    res.json(cases);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getCase = async (req: Request, res: Response) => {
  try {
    const doctorId = req.user!.userId;
    const caseRecord = await getCaseById(doctorId, req.params.id);
    res.json(caseRecord);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const diagnoseCase = async (req: Request, res: Response) => {
  try {
    const doctorId = req.user!.userId;
    const { finalDiagnosis, doctorNotes, status } = req.body;
    if (!finalDiagnosis) {
      res.status(400).json({ error: "finalDiagnosis is required" });
      return;
    }
    const updated = await submitFinalDiagnosis(doctorId, req.params.id, {
      finalDiagnosis,
      doctorNotes,
      status,
    });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
