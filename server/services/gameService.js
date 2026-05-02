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
