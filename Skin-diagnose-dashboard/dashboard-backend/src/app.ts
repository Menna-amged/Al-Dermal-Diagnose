import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import doctorsRoutes from "./modules/doctors/doctors.routes";
import patientsRoutes from "./modules/patients/patients.routes";
import casesRoutes from "./modules/cases/cases.routes";
import reportsRoutes from "./modules/reports/reports.routes";
import statisticsRoutes from "./modules/statistics/statistics.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/doctors", doctorsRoutes);
app.use("/patients", patientsRoutes);
app.use("/cases", casesRoutes);
app.use("/reports", reportsRoutes);
app.use("/statistics", statisticsRoutes);

// Global error handler — converts Prisma constraint errors to friendly messages
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err?.code === "P2002") {
    const field = err?.meta?.target?.[0] ?? "field";
    res.status(400).json({ error: `This ${field} is already in use` });
    return;
  }
  res.status(500).json({ error: err?.message ?? "Something went wrong" });
});

export default app;
