import { Router } from "express";
import { ReportController } from "../controllers";
import upload from "../utils/upload.middleware";



const router = Router();

router.post("/",upload.single("file"), ReportController.submitReport);

export default router;