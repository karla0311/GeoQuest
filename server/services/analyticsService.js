import supabase from "../config/supabaseClient.js";

export async function getUserStats(userId, mode = "all") {
  let query = supabase
    .from("game_results")
    .select("score, time_taken, accuracy, is_daily")
    .eq("user_id", userId);

  // 🔥 FILTER BASED ON MODE
  if (mode === "daily") {
    query = query.eq("is_daily", true);
  } else if (mode === "practice") {
    query = query.eq("is_daily", false);
  }

  const { data, error } = await query;

  if (error) throw error;

  const games_played = data.length;

  if (games_played === 0) {
    return {
      games_played: 0,
      avg_score: 0,
      avg_time: 0,
      avg_accuracy: 0,
    };
  }

  const avg_score = Math.round(
    data.reduce((sum, r) => sum + (r.score ?? 0), 0) / games_played
  );

  const avg_time = Math.round(
    data.reduce((sum, r) => sum + (r.time_taken ?? 0), 0) / games_played
  );

  const avg_accuracy = Math.round(
    data.reduce((sum, r) => sum + (r.accuracy ?? 0), 0) / games_played
  );

  return {
    games_played,
    avg_score,
    avg_time,
    avg_accuracy,
  };
}