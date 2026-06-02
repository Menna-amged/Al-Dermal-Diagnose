import { Request, Response } from "express";
import { getAssignedPatients, getPatientDetails } from "./patients.service";

export const listPatients = async (req: Request, res: Response) => {
  try {
    const doctorId = req.user!.userId;
    const patients = await getAssignedPatients(doctorId);
    res.json(patients);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getPatient = async (req: Request, res: Response) => {
  try {
    const doctorId = req.user!.userId;
    const { id } = req.params;
    const patient = await getPatientDetails(doctorId, id);
    res.json(patient);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
