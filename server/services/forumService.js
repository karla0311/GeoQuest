import supabase from "../config/supabaseClient.js"

export const getAllPosts = async () => {
  const { data, error } = await supabase
    .from("forum_posts")
    .select(`
      *,
      profiles:user_id ( username ),
      forum_comments (
        id,
        body,
        created_at,
        user_id,
        profiles:user_id ( username )
      ),
      forum_votes ( id, user_id )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("getAllPosts error:", JSON.stringify(error, null, 2))
    throw error
  }

  // Normalize forum_votes to always be an array
  const normalized = data.map((post) => ({
    ...post,
    forum_votes: !post.forum_votes
      ? []
      : Array.isArray(post.forum_votes)
      ? post.forum_votes
      : [post.forum_votes],
    forum_comments: !post.forum_comments
      ? []
      : Array.isArray(post.forum_comments)
      ? post.forum_comments
      : [post.forum_comments],
  }))

  return normalized
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

export const getCommentsByPost = async (postId) => {
  const { data, error } = await supabase
    .from("forum_comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true })

  if (error) throw error
  return data
}

export const createComment = async (userId, postId, body) => {
  const { data, error } = await supabase
    .from("forum_comments")
    .insert([{ user_id: userId, post_id: postId, body }])
    .select()
    .single()

  if (error) throw error
  return data
}

export const toggleVote = async (userId, postId) => {
  const { data: existing, error: selectError } = await supabase
    .from("forum_votes")
    .select("*")
    .eq("user_id", userId)
    .eq("post_id", postId)
    .maybeSingle()

  console.log("toggleVote check:", { userId, postId, existing, selectError })

  if (existing) {
    const { error: deleteError } = await supabase
      .from("forum_votes")
      .delete()
      .eq("id", existing.id)

    console.log("deleted vote:", { deleteError })
    return { voted: false }
  } else {
    const { data: inserted, error: insertError } = await supabase
      .from("forum_votes")
      .insert([{ user_id: userId, post_id: postId }])
      .select()

    console.log("inserted vote:", { inserted, insertError }) 
    return { voted: true }
  }
}

export const updatePost = async (postId, userId, title, body) => {
  const { data, error } = await supabase
    .from("forum_posts")
    .update({ title, body })
    .eq("id", postId)
    .eq("user_id", userId) // ownership check
    .select()
    .single()

  if (error) throw error
  return data
}

export const deletePost = async (postId, userId) => {
  const { error } = await supabase
    .from("forum_posts")
    .delete()
    .eq("id", postId)
    .eq("user_id", userId)

  if (error) throw error
}