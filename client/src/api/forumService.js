import API from "./api"

export const getPosts = async () => {
  const res = await API.get("/forum")
  return res.data
}

export const createPost = async (post) => {
  const res = await API.post("/forum", post)
  return res.data
}