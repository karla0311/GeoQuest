import { Router } from "express";
import { submitResult } from "../controllers/gameController.js"
import { requireAuth } from "../middleware/authMiddleware.js"

const router = Router();

router.post("/result", requireAuth, submitResult)

// POST /game/start
// GET  /game/daily
// GET  /game/stage/:n

export default router;
