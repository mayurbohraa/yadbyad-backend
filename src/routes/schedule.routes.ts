import { Router } from "express";
import { ScheduleController } from "../controllers";
import { jwtverify } from "../middlewares";

const router = Router();

router.use(jwtverify);
router.get("/", ScheduleController.getSchedule);
router.post("/", ScheduleController.schedule);
export default router;
