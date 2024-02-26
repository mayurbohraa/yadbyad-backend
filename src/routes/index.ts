import { Router } from "express";
import authRoutes from "./auth.routes";
import settingsRoutes from "./settings.routes";
import scheduleRoutes from "./schedule.routes";
import complainRoutes from "./complain.routes";
import reportRoutes from "./report.routes";

const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/settings", settingsRoutes);
routes.use("/schedule", scheduleRoutes);
routes.use("/complain", complainRoutes);
routes.use("/reports", reportRoutes);
export default routes;
