import { Router } from "express";
import { ReportController } from "../controllers";
import upload from "../utils/upload.middleware";



const router = Router();

router.post("/:userId",upload.single("file"), ReportController.submitReport);
router.get("/:userId/fetchReport/:id", ReportController.fetchReport);
router.put("/:userId/remarks/:id", ReportController.remarks);
router.delete("/:userId/deleteReport/:id", ReportController.deleteReport);

export default router;