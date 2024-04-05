import { Router } from "express";
import { ScheduleController } from "../controllers";
import { jwtverify } from "../middlewares";

const router = Router();

router.use(jwtverify);
router.get("/", ScheduleController.getSchedule);
router.get("/scheduleadmin", ScheduleController.getScheduleAdmin);
router.post("/request", ScheduleController.postSchedule);
router.get("/adminFetchExam", ScheduleController.getAdminFetchExam);
// request by part time student on the created exam
router.post("/partTimeRequest/:examId", ScheduleController.addRequesteeId);

// to update (accept or reject) the request by Special need student sended by part Time student
router.put("/specialNeedUpdate/:id/:update", ScheduleController.requestUpdateSpecialNeed);


// router.post("/", ScheduleController.schedule);
// router.get("/requestsadmin", ScheduleController.getRequestAdmin);
// router.get("/requests", ScheduleController.getRequest);
// router.put("/request/:id", ScheduleController.requestUpdate);
// router.get("/matches/:type", ScheduleController.matches);
export default router;
