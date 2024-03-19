import { Router } from "express";
import { SlotRequestController } from "../controllers";
import { jwtverify } from "../middlewares";

const router = Router();

router.use(jwtverify);

// for sp students
router.get("/", SlotRequestController.getRequests); // check

// for sp students
router.post("/update/:id/:update", SlotRequestController.requestUpdate); // check

// for part students
router.get("/accepted", SlotRequestController.requestAccepted); // check

// for pt student to request student
router.post("/request", SlotRequestController.postRequest); // check

export default router;
