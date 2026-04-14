import * as forumService from "../services/forumService.js"

export const getPosts = async (req, res) => {
  try {
    const posts = await forumService.getAllPosts()
    res.json(posts)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch posts" })
  }
}

export const createPost = async (req, res) => {
  try {
    const userId = req.user.id
    const { title, body } = req.body

    const post = await forumService.createPost(userId, title, body)
    res.status(201).json(post)
  } catch (err) {
    res.status(500).json({ error: "Failed to create post" })
  }
}