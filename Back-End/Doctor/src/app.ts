import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import profileRoutes from "./modules/profile/profile.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import patientsRoutes from "./modules/patients/patients.routes";
import casesRoutes from "./modules/cases/cases.routes";
import appointmentsRoutes from "./modules/appointments/appointments.routes";
import alertsRoutes from "./modules/alerts/alerts.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/patients", patientsRoutes);
app.use("/cases", casesRoutes);
app.use("/appointments", appointmentsRoutes);
app.use("/alerts", alertsRoutes);

export default app;
