import supabase from "../config/supabaseClient.js"

export const saveResult = async (userId, { score, stage, time_taken, accuracy, is_daily }) => {
  
  console.log("FINAL CHECK - DATA GOING TO SUPABASE:", { user_id: userId, score, stage, time_taken, accuracy, is_daily });

  const { data, error } = await supabase
  .from("game_results")
  .insert([{ user_id: userId, score, stage, time_taken, accuracy, is_daily }])
  .select()
  .single()

  if (error) {
    console.error("SUPABASE ERROR:", error); 
    throw error
  }
  
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

export const getDailyStatus = async (userId) => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  const { data, error } = await supabase
    .from("game_results")
    .select("stage, score, time_taken, accuracy")
    .eq("user_id", userId)
    .eq("is_daily", true)
    // filter for rows created since the start of today
    .gte("played_at", `${today}T00:00:00Z`); 

  if (error) throw error;
  return data; // returns an array of completed stages for today
};