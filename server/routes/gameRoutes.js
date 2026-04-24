import { Router } from "express";
import { submitResult, getLastResult } from "../controllers/gameController.js"
import { requireAuth } from "../middleware/authMiddleware.js"

const router = Router();

router.post("/result", requireAuth, submitResult)
router.get("/last", requireAuth, getLastResult)

// POST /game/start
// GET  /game/daily
// GET  /game/stage/:n

export default router;
