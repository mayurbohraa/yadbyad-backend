import { Router } from "express";
import { ReportSlotController } from "../controllers";
import { jwtverify } from "../middlewares";

const router = Router();

router.use(jwtverify);
router.post("/createReportSlot", ReportSlotController.createSlot);

export default router;
