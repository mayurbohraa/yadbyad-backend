import { Router } from "express";
import { ReportController } from "../controllers";
import upload from "../utils/upload.middleware";
import { jwtverify } from "../middlewares";


const router = Router();
router.use(jwtverify);
router.post("/submitReport/:slotId",upload.single("file"), ReportController.submitReport);
router.get("/fetchReport", ReportController.fetchReport);
router.get("/fetchAllReport", ReportController.fetchAllReport);
router.post("/remarks/:id", ReportController.remarks);
router.delete("/deleteReport/:id", ReportController.deleteReport);

export default router;