import { Request, Response, NextFunction } from "express";
import { getAllPatients, createPatient, updatePatient, deletePatient } from "./patients.service";

export const getAll = async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json(await getAllPatients()); } catch (err) { next(err); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try { res.status(201).json(await createPatient(req.body)); } catch (err) { next(err); }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await updatePatient(req.params.id as string, req.body)); } catch (err) { next(err); }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try { await deletePatient(req.params.id as string); res.json({ message: "Patient deleted" }); } catch (err) { next(err); }
};
