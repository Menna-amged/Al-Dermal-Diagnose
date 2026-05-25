import { Request, Response } from "express";
import { getStatistics } from "./statistics.service";

export const getStats = async (_req: Request, res: Response) => {
  try {
    res.json(await getStatistics());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
