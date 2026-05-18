import { Request, Response } from "express";
import { getAlerts, markAsRead, markAllAsRead, deleteAlert, createAlert } from "./alerts.service";

export const list = async (req: Request, res: Response) => {
  try {
    const doctorId = req.user!.userId;
    const unreadOnly = req.query.unread === "true";
    const alerts = await getAlerts(doctorId, unreadOnly);
    res.json(alerts);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const read = async (req: Request, res: Response) => {
  try {
    const doctorId = req.user!.userId;
    const updated = await markAsRead(doctorId, req.params.id);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const readAll = async (req: Request, res: Response) => {
  try {
    const doctorId = req.user!.userId;
    const result = await markAllAsRead(doctorId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const doctorId = req.user!.userId;
    const result = await deleteAlert(doctorId, req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const doctorId = req.user!.userId;
    const { title, message, type } = req.body;
    if (!title || !message) {
      res.status(400).json({ error: "title and message are required" });
      return;
    }
    const alert = await createAlert(doctorId, { title, message, type });
    res.status(201).json(alert);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
