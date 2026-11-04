import { Router } from "express";
import { AuthenticationController } from "../controllers";
import { jwtverify } from "../middlewares";
import { accountRateLimit } from "../middlewares/account-rate-limit";

const router = Router();

router.post("/login", accountRateLimit(60), AuthenticationController.login);
router.post("/signup", accountRateLimit(20), AuthenticationController.signup);
router.post(
  "/forgotPassword",
  accountRateLimit(20),
  AuthenticationController.forgotPassword,
);
router.post(
  "/recovery/verify",
  accountRateLimit(20),
  AuthenticationController.verifyRecoveryCode,
);
router.post(
  "/recovery/request",
  accountRateLimit(5),
  AuthenticationController.requestRecovery,
);

router.use(jwtverify);
router.get("/me", AuthenticationController.me);
router.post("/logout", AuthenticationController.logout);
router.get("/recovery/code", AuthenticationController.recoveryCode);
router.get("/recovery/requests", AuthenticationController.recoveryRequests);
router.post(
  "/recovery/requests/:id/approve",
  AuthenticationController.approveRecovery,
);

router.get("/users", AuthenticationController.users);
router.get("/users/:id", AuthenticationController.editUsers);
router.put("/users/:id", AuthenticationController.updateUsers);
router.delete("/users/:id", AuthenticationController.deleteUsers);
router.post("/users/changePassword", AuthenticationController.changePassword);
router.post("/users/profile/:id", AuthenticationController.editProfile);
export default router;
