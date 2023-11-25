import { Router } from "express";
import { AuthenticationController } from "../controllers";
import { jwtverify } from "../middlewares";

const router = Router();

router.post("/signup", AuthenticationController.signup);
router.post("/signup", AuthenticationController.signup);
router.get("/users", AuthenticationController.users);

export default router;
