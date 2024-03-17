import { Router } from "express";
import { NotificationController } from "../controllers";
import { jwtverify } from "../middlewares";

const router = Router();



router.post("/createNotification", NotificationController.createNotification);

router.use(jwtverify);

// used for fetching the replied complain and remarked report 
router.get("/fetchNotification/:userId", NotificationController.fetchSpecificNotification);

// fetch all notifications related to ( slot created, slot deleted, resource created and resource edited)
router.get("/fetchNotification", NotificationController.fetchNotification);

// fetch only complain and report submit notifications
router.get("/fetchAdminNotification", NotificationController.fetchAdminNotification);
router.post("/readNotification", NotificationController.readNotification);

export default router;
