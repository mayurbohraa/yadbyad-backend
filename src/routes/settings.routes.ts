import { Router } from "express";
import { SettingsController } from "../controllers";
import { jwtverify } from "../middlewares";

const router = Router();

router.use(jwtverify);
router.get("/", SettingsController.getSettings);
export default router;
