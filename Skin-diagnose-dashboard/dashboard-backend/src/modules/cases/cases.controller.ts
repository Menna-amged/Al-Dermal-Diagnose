import { Request, Response, NextFunction } from "express";
import { getAllCases, createCase, updateCase, deleteCase } from "./cases.service";

export const getAll = async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json(await getAllCases()); } catch (err) { next(err); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try { res.status(201).json(await createCase(req.body)); } catch (err) { next(err); }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await updateCase(req.params.id as string, req.body)); } catch (err) { next(err); }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try { await deleteCase(req.params.id as string); res.json({ message: "Case deleted" }); } catch (err) { next(err); }
};
