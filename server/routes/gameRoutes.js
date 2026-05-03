import { Router } from "express";
import { submitResult, getLastResult, checkDailyStatus } from "../controllers/gameController.js"
import { requireAuth } from "../middleware/authMiddleware.js"

const router = Router();

router.post("/result", requireAuth, submitResult)
router.get("/last", requireAuth, getLastResult)

router.get("/daily-status", requireAuth, checkDailyStatus);

export default router;