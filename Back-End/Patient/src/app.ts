import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import usersRoutes from "./modules/users/users.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);

export default app;