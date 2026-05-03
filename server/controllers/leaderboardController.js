import {
  getTop10,
  getUserRank,
} from "../services/leaderboardService.js";

export async function fetchLeaderboard(req, res) {
  try {
    const { is_daily, user_id } = req.query;

    const top10 = await getTop10(is_daily === "true");
    const me = user_id
      ? await getUserRank(user_id, is_daily === "true")
      : null;

    res.json({ top10, me });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
}