import supabase from "../config/supabaseClient.js";

export async function getUserStats(req, res) {
  const userId = req.user.id;

  const { data, error } = await supabase
    .from("official_stats") 
    .select("total_games_played, avg_score, average_time, avg_accuracy")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
        return res.json({ games_played: 0, avg_score: 0, avg_time: 0, avg_accuracy: 0 });
    }
    return res.status(500).json({ error: error.message });
  }

  res.json({ 
    games_played: data.total_games_played, 
    avg_score: data.avg_score, 
    avg_time: Math.round(data.average_time), 
    avg_accuracy: data.avg_accuracy 
  });
}