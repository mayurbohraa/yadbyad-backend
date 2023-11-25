import { Router } from "express";
import { ScheduleController } from "../controllers";
import { jwtverify } from "../middlewares";

const router = Router();

router.use(jwtverify);
router.get("/", ScheduleController.getSchedule);
router.post("/", ScheduleController.schedule);
router.get("/requests", ScheduleController.getRequest);
router.post("/request", ScheduleController.request);
router.put("/request/:id", ScheduleController.requestUpdate);
router.get("/matches", ScheduleController.matches);
export default router;
