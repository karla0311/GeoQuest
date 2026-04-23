import supabase from "../config/supabaseClient.js"

export const saveResult = async (userId, { score, stage, time_taken, accuracy }) => {
  const { data, error } = await supabase
    .from("game_results")
    .insert([{ user_id: userId, score, stage, time_taken, accuracy }])
    .select()
    .single()

  if (error) throw error
  return data
}

// fetches the most recent game row for a user, or null if they've never played
export const getLastResult = async (userId) => {
  const { data, error } = await supabase
    .from("game_results")
    .select("*")
    .eq("user_id", userId)
    .order("played_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}
