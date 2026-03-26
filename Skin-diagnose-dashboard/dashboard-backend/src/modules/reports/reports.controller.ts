import { Request, Response, NextFunction } from "express";
import { getAllReports, createReport, updateReport, deleteReport, publishReport } from "./reports.service";

export const getAll = async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json(await getAllReports()); } catch (err) { next(err); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try { res.status(201).json(await createReport(req.body)); } catch (err) { next(err); }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await updateReport(req.params.id, req.body)); } catch (err) { next(err); }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try { await deleteReport(req.params.id); res.json({ message: "Report deleted" }); } catch (err) { next(err); }
};

export const publish = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await publishReport(req.params.id)); } catch (err) { next(err); }
};
