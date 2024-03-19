import { Router } from "express";
import { LectureController } from "../controllers";
import { jwtverify } from "../middlewares";

const router = Router();

router.use(jwtverify);
router.get("/", LectureController.getLectures);
router.get("/scheduleadmin", LectureController.getLecturesAdmin);
router.post("/request", LectureController.postLecture);

// router.post("/", ScheduleController.schedule);
// router.get("/requestsadmin", ScheduleController.getRequestAdmin);
// router.get("/requests", ScheduleController.getRequest);
// router.put("/request/:id", ScheduleController.requestUpdate);
// router.get("/matches/:type", ScheduleController.matches);
export default router;
