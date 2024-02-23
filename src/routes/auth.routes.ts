import { Router } from "express";
import { AuthenticationController } from "../controllers";
import { jwtverify } from "../middlewares";

const router = Router();

router.post("/login", AuthenticationController.login);
router.post("/signup", AuthenticationController.signup);
router.get("/users", AuthenticationController.users);
// router.get("/users/edit", AuthenticationController.editUsers);

export default router;
