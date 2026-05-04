import { Router } from "express";
import { fetchLeaderboard } from "../controllers/leaderboardController.js";

const router = Router();

router.get("/", fetchLeaderboard);

export default router;