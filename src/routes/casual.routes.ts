import { Router } from "express";
import { CasualController } from "../controllers";
import { jwtverify } from "../middlewares";

const router = Router();

router.use(jwtverify);

/* ----------- 
 this route is for fetching causal requests filtered by requestee id :
 if admin then all casual request 
 else request with user id == student id 
--------------*/
router.get("/", CasualController.getRequests);

// to update (accept or reject) the request by admin
router.put("/update/:id/:update", CasualController.requestUpdateAdmin);

// to update (accept or reject) the request by Special need student sended by part Time student
router.put("/specialNeedUpdate/:id/:update", CasualController.requestUpdateSpecialNeed);

// to create the request by student
router.post("/request", CasualController.postCasual);

// to show the casual which are accepted
router.get("/accept", CasualController.casualAccepted);

// request by part time student on the created casual
router.post("/partTimeRequest/:casualId", CasualController.addRequesteeId);

// router.get("/scheduleadmin", LectureController.getLecturesAdmin);
// router.post("/", ScheduleController.schedule);
// router.get("/requestsadmin", ScheduleController.getRequestAdmin);
// router.get("/requests", ScheduleController.getRequest);
// router.get("/matches/:type", ScheduleController.matches);
export default router;
