import { Router } from "express";
import Controller from "../controller";

const router = Router();

router.get("/nearest", Controller.NearestTemp as any);
router.get("/status", Controller.Status as any);
router.post("/update", Controller.Update as any);

export default router;
