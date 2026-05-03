import supabase from "../config/supabaseClient.js"

export const saveResult = async (userId, { score, stage, time_taken, accuracy, is_daily }) => {
  const { data, error } = await supabase
    .from("game_results")
    .insert([{ user_id: userId, score, stage, time_taken, accuracy, is_daily }])
    .select()
    .single()

  if (error) throw error
  return data
}

// fetches the 3 most recent game rows for the session summary on Results
export const getLastResult = async (userId) => {
  const { data, error } = await supabase
    .from("game_results")
    .select("*")
    .eq("user_id", userId)
    .order("played_at", { ascending: false })
    .limit(3)

  if (error) throw error
  return data
}

// returns the daily-challenge rows the user has saved since UTC midnight
export const getDailyStatus = async (userId) => {
  const todayUtcMidnight = new Date()
  todayUtcMidnight.setUTCHours(0, 0, 0, 0)
  const cutoff = todayUtcMidnight.toISOString().replace("Z", "")

  const { data, error } = await supabase
    .from("game_results")
    .select("stage, score, time_taken, accuracy")
    .eq("user_id", userId)
    .eq("is_daily", true)
    .gte("played_at", cutoff)

  if (error) throw error
  return data
}
