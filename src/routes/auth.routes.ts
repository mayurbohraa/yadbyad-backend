import { Router } from "express";
import { AuthenticationController } from "../controllers";
import { jwtverify } from "../middlewares";

const router = Router();

router.post("/login", AuthenticationController.login);
router.post("/signup", AuthenticationController.signup);
router.get("/users", AuthenticationController.users);
router.get("/users/:id", AuthenticationController.editUsers);
router.put("/users/:id", AuthenticationController.updateUsers);
router.delete("/users/:id", AuthenticationController.deleteUsers);
router.post("/users/forgotPassword", AuthenticationController.forgotPassword);
router.put("/users/profile/:id", AuthenticationController.editProfile);
export default router;
