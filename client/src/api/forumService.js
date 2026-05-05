import API from "./api"

export const getPosts = async () => {
  const res = await API.get("/forum")
  return res.data
}

export const createPost = async (post) => {
  const res = await API.post("/forum", post)
  return res.data
}

export const addComment = (postId, body) =>
  API.post("/forum/comment", { postId, body })

export const votePost = (postId) =>
  API.post("/forum/vote", { postId })

export const updatePost = (id, data) =>
  API.put(`/forum/${id}`, data)

export const deletePost = (id) =>
  API.delete(`/forum/${id}`)

export const updateComment = (id, body) =>
  API.put(`/forum/comment/${id}`, { body })

export const deleteComment = (id) =>
  API.delete(`/forum/comment/${id}`)