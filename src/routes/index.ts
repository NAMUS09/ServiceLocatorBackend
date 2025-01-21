import { Router } from "express";
import Controller from "../controller";

const router = Router();

router.get("/all", Controller.GetALL as any);
router.get("/nearest", Controller.Nearest as any);
router.get("/status", Controller.Status as any);
router.post("/create", Controller.Create as any);
router.post("/update", Controller.Update as any);

export default router;
