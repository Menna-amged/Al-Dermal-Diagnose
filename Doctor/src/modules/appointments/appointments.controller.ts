import { Request, Response } from "express";
import {
  getAppointments, createAppointment, updateAppointment, deleteAppointment,
} from "./appointments.service";

export const list = async (req: Request, res: Response) => {
  try {
    const doctorId = req.user!.userId;
    const { date } = req.query;
    const appointments = await getAppointments(doctorId, date as string | undefined);
    res.json(appointments);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const doctorId = req.user!.userId;
    const { patientName, date, time, type, notes } = req.body;
    if (!patientName || !date || !time || !type) {
      res.status(400).json({ error: "patientName, date, time, and type are required" });
      return;
    }
    const appt = await createAppointment(doctorId, { patientName, date, time, type, notes });
    res.status(201).json(appt);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const doctorId = req.user!.userId;
    const updated = await updateAppointment(doctorId, req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const doctorId = req.user!.userId;
    const result = await deleteAppointment(doctorId, req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
