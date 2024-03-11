import { Router } from "express";
import { ReportSlotController } from "../controllers";
import { jwtverify } from "../middlewares";

const router = Router();

router.use(jwtverify);
router.get("/createReportSlot", ReportSlotController.createSlot);
// router.get("/scheduleadmin", ScheduleController.getScheduleAdmin);
// router.post("/", ScheduleController.schedule);
// router.get("/requestsadmin", ScheduleController.getRequestAdmin);
// router.get("/requests", ScheduleController.getRequest);
// router.post("/request", ScheduleController.request);
// router.put("/request/:id", ScheduleController.requestUpdate);
// router.get("/matches/:type", ScheduleController.matches);
export default router;
