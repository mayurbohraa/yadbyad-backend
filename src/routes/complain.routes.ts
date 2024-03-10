import { Router } from "express";
import { ComplainController } from "../controllers";
import { jwtverify } from "../middlewares";


const router = Router();

router.use(jwtverify);

router.post("/submitComplain", ComplainController.submitComplain);

router.get("/fetchComplain", ComplainController.fetchComplain);

router.get("/fetchAllComplain", ComplainController.fetchAllComplain);

router.post("/replyComplain/:id", ComplainController.replyComplain);

router.delete("/deleteComplain/:id", ComplainController.deleteComplain);

export default router;
