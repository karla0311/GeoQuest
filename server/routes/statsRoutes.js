import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { getUserStatsController } from "../controllers/analyticsController.js";

const router = Router();

router.get("/user", requireAuth,getUserStatsController);

export default router;
