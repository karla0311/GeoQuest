import supabase from "../config/supabaseClient.js"

export const saveResult = async (userId, { score, stage, time_taken, accuracy, country }) => {
  const row = { user_id: userId, score, stage, time_taken, accuracy }
  // country only set for new games so older rows without it stay consistent
  if (country) row.country = country

  const { data, error } = await supabase
    .from("game_results")
    .insert([row])
    .select()
    .single()

  if (error) throw error
  return data
}

// returns one game row only if it belongs to the requesting user
export const getResultById = async (id, userId) => {
  const { data, error } = await supabase
    .from("game_results")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle()

  if (error) throw error
  return data
}

// full game history for a user, capped so a heavy user doesn't blow up the payload
export const getAllResults = async (userId, limit = 100) => {
  const { data, error } = await supabase
    .from("game_results")
    .select("*")
    .eq("user_id", userId)
    .order("played_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
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

// returns the user's last N games for the dashboard activity feed
export const getRecentResults = async (userId, limit = 5) => {
  const { data, error } = await supabase
    .from("game_results")
    .select("*")
    .eq("user_id", userId)
    .order("played_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}
