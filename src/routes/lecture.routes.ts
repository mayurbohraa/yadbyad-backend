import { Router } from "express";
import { LectureController } from "../controllers";
import { jwtverify } from "../middlewares";

const router = Router();

router.use(jwtverify);
router.get("/", LectureController.getLectures);
router.get("/scheduleadmin", LectureController.getLecturesAdmin);
router.post("/request", LectureController.postLecture);

// request by part time student on the created lecture
router.post("/partTimeRequest/:casualId", LectureController.addRequesteeId);

// to update (accept or reject) the request by Special need student sended by part Time student
router.put("/specialNeedUpdate/:id/:update",LectureController.requestUpdateSpecialNeed);

export default router;
