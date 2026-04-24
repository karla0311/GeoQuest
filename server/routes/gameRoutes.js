import { Router } from "express";
import {
  submitResult,
  getLastResult,
  getRecentResults,
  getResultById,
  getAllResults,
} from "../controllers/gameController.js"
import { requireAuth } from "../middleware/authMiddleware.js"

const router = Router();

router.post("/result", requireAuth, submitResult)
router.get("/last", requireAuth, getLastResult)
router.get("/recent", requireAuth, getRecentResults)
router.get("/history", requireAuth, getAllResults)
// keep :id last so the static routes above resolve first
router.get("/:id", requireAuth, getResultById)

// POST /game/start
// GET  /game/daily
// GET  /game/stage/:n

export default router;
