import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { getUserStats } from "../controllers/analyticsController.js";

const router = Router();

router.get("/user", requireAuth, getUserStats);

export default router;
