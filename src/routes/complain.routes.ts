import { Router } from "express";
import { ComplainController } from "../controllers";
import { jwtverify } from "../middlewares";

const router = Router();

router.post("/submitComplain", ComplainController.submitComplain);
router.get("/fetchComplain/:id", ComplainController.fetchComplain);
router.put("/replyComplain/:id", ComplainController.replyComplain);
router.delete("/deleteComplain/:id", ComplainController.deleteComplain);

export default router;
