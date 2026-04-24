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
