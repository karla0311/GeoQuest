import supabase from "../config/supabaseClient.js"

export const getAllPosts = async () => {
  const { data, error } = await supabase
    .from("forum_posts")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export const createPost = async (userId, title, body) => {
  const { data, error } = await supabase
    .from("forum_posts")
    .insert([{ user_id: userId, title, body }])
    .select()
    .single()

  if (error) throw error
  return data
}