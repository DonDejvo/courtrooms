import { Router } from "express";
import mediaController from "../controllers/mediaController";

const router = Router();
router.get("/files/:id", mediaController.getFileContentById);

export default router;
