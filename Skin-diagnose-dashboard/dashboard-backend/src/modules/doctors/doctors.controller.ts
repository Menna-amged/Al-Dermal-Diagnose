import { Request, Response, NextFunction } from "express";
import { getAllDoctors, createDoctor, updateDoctor, deleteDoctor, toggleBan } from "./doctors.service";

export const getAll = async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json(await getAllDoctors()); } catch (err) { next(err); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try { res.status(201).json(await createDoctor(req.body)); } catch (err) { next(err); }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await updateDoctor(req.params.id, req.body)); } catch (err) { next(err); }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try { await deleteDoctor(req.params.id); res.json({ message: "Doctor deleted" }); } catch (err) { next(err); }
};

export const toggleBanDoctor = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await toggleBan(req.params.id)); } catch (err) { next(err); }
};
