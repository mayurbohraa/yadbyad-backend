import { Router } from "express";
import { ResourceController } from "../controllers";
import { jwtverify } from "../middlewares";


const router = Router();

router.use(jwtverify);

router.post("/createResource", ResourceController.createResource);

router.get("/fetchResource", ResourceController.fetchResources);

router.post("/editResource/:id", ResourceController.editResource);

router.delete("/deleteResource/:id", ResourceController.deleteResource);

export default router;
