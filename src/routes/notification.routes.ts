import { Router } from "express";
import { NotificationController } from "../controllers";


const router = Router();



router.post("/createNotification", NotificationController.createNotification);
router.get("/fetchNotification", NotificationController.fetchNotification);
router.post("/readNotification", NotificationController.readNotification);

export default router;
