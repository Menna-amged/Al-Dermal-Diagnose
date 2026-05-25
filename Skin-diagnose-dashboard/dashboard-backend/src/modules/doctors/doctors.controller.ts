import { Request, Response, NextFunction } from "express";
import { getAllDoctors, createDoctor, updateDoctor, deleteDoctor, toggleBan, setDoctorPassword } from "./doctors.service";

export const getAll = async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json(await getAllDoctors()); } catch (err) { next(err); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try { res.status(201).json(await createDoctor(req.body)); } catch (err) { next(err); }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await updateDoctor(req.params.id as string, req.body)); } catch (err) { next(err); }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try { await deleteDoctor(req.params.id as string); res.json({ message: "Doctor deleted" }); } catch (err) { next(err); }
};

export const toggleBanDoctor = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await toggleBan(req.params.id as string)); } catch (err) { next(err); }
};

export const setPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 8)
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    res.json(await setDoctorPassword(req.params.id as string, password));
  } catch (err) { next(err); }
};
