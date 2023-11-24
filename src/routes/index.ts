import { Router } from "express";
import authRoutes from "./auth.routes";
import settingsRoutes from "./settings.routes";
import scheduleRoutes from "./schedule.routes";

const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/settings", settingsRoutes);
routes.use("/schedule", scheduleRoutes);

export default routes;
