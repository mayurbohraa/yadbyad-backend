import { Router } from "express";
import authRoutes from "./auth.routes";
import scheduleRoutes from "./exam.routes";
import complainRoutes from "./complain.routes";
import reportRoutes from "./report.routes";
import reportSlotRoutes from "./reportSlot.routes";
import resourceRoutes from "./resource.routes";
import notificationRoutes from "./notification.routes";
import lectureRoutes from "./lecture.routes";
import casualRoutes from "./casual.routes";
import slotRoutes from "./slot-request.routes";

const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/schedule", scheduleRoutes);
routes.use("/complain", complainRoutes);
routes.use("/reports", reportRoutes);
routes.use("/reportSlot", reportSlotRoutes);
routes.use("/library", resourceRoutes);
routes.use("/notifications", notificationRoutes);
routes.use("/lecture", lectureRoutes);
routes.use("/casual", casualRoutes);
routes.use("/slot", slotRoutes);


export default routes;
