import { Router } from "express";
import { ComplainController } from "../controllers";
import { jwtverify } from "../middlewares";


const router = Router();

router.use(jwtverify);
// router.post("/:userId/submitComplain", ComplainController.submitComplain);
router.post("/submitComplain", ComplainController.submitComplain);
// router.get("/:userId/fetchComplain/:id", ComplainController.fetchComplain);
router.get("/fetchComplain/:id", ComplainController.fetchComplain);

// router.put("/:userId/replyComplain/:id", ComplainController.replyComplain);
router.put("/replyComplain/:id", ComplainController.replyComplain);
// router.delete("/:userId/deleteComplain/:id", ComplainController.deleteComplain);
router.delete("/deleteComplain/:id", ComplainController.deleteComplain);

export default router;
