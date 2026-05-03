import supabase from "../config/supabaseClient.js";

export async function getUserStats(req, res) {
  const userId = req.user.id;

  const { data, error } = await supabase
    .from("game_results")
    .select("score, time_taken, accuracy")
    .eq("user_id", userId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const games_played = data.length;

  if (games_played === 0) {
    return res.json({ games_played: 0, avg_score: 0, avg_time: 0, avg_accuracy: 0 });
  }

  const avg_score = Math.round(data.reduce((sum, r) => sum + (r.score ?? 0), 0) / games_played);
  const avg_time = Math.round(data.reduce((sum, r) => sum + (r.time_taken ?? 0), 0) / games_played);
  const avg_accuracy = Math.round(data.reduce((sum, r) => sum + (r.accuracy ?? 0), 0) / games_played);

  res.json({ games_played, avg_score, avg_time, avg_accuracy });
}
