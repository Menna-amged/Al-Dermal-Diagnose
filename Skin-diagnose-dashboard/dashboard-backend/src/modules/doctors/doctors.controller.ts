import { Request, Response, NextFunction } from "express";
import { getAllDoctors, createDoctor, updateDoctor, deleteDoctor, toggleBan, setDoctorPassword } from "./doctors.service";

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

export const setPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6)
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    res.json(await setDoctorPassword(req.params.id, password));
  } catch (err) { next(err); }
};
