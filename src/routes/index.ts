import { Router } from "express";
import authRoutes from "./auth.routes";
import settingsRoutes from "./settings.routes";
import scheduleRoutes from "./schedule.routes";
import complainRoutes from "./complain.routes";
import reportRoutes from "./report.routes";
import reportSlotRoutes from "./reportSlot.routes";
import resourceRoutes from "./resource.routes";
import notificationRoutes from "./notification.routes";

const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/settings", settingsRoutes);
routes.use("/schedule", scheduleRoutes);
routes.use("/complain", complainRoutes);
routes.use("/reports", reportRoutes);
routes.use("/reportSlot", reportSlotRoutes);
routes.use("/library", resourceRoutes);
routes.use("/notifications", notificationRoutes)

export default routes;
