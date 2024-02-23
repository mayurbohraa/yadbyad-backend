import { Router } from "express";
import { AuthenticationController } from "../controllers";
import { jwtverify } from "../middlewares";

const router = Router();

router.post("/login", AuthenticationController.login);
router.post("/signup", AuthenticationController.signup);
router.get("/users", AuthenticationController.users);
router.get("/users/:username", AuthenticationController.editUsers);
router.put("/users/:id", AuthenticationController.updateUsers);
router.delete("/users/:id", AuthenticationController.deleteUsers);

export default router;
