import { Router } from "express";
import { NotificationController } from "../controllers";
import { jwtverify } from "../middlewares";

const router = Router();



router.post("/createNotification", NotificationController.createNotification);

router.use(jwtverify);

router.get("/fetchNotification", NotificationController.fetchNotification);

router.post("/readNotification", NotificationController.readNotification);

export default router;
