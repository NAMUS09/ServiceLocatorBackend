import { Router } from "express";
import Controller from "../controller/serviceController";

const router = Router();

router.get("/all", Controller.GetALL);
router.get("/nearest", Controller.Nearest);
router.get("/status", Controller.Status);
router.post("/create", Controller.Create);
router.post("/update", Controller.Update);

export default router;
