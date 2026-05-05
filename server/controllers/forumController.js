import * as forumService from "../services/forumService.js"

export const getPosts = async (req, res) => {
  try {
    const posts = await forumService.getAllPosts()
    res.json(posts)
  } catch (err) {
    console.error("getPosts error:", err)
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
    console.error("createPost error:", err)
    res.status(500).json({ error: "Failed to create post" })
  }
}

export const addComment = async (req, res) => {
  try {
    const userId = req.user.id
    const { postId, body } = req.body
    console.log("addComment called:", { userId, postId, body })
    const comment = await forumService.createComment(userId, postId, body)
    res.status(201).json(comment)
  } catch (err) {
    console.error("addComment error:", err)
    res.status(500).json({ error: "Failed to add comment" })
  }
}

export const votePost = async (req, res) => {
  try {
    const userId = req.user.id
    const { postId } = req.body
    console.log("votePost called:", { userId, postId })
    const result = await forumService.toggleVote(userId, postId)
    res.json(result)
  } catch (err) {
    console.error("votePost error:", err)
    res.status(500).json({ error: "Vote failed" })
  }
}

export const editPost = async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    const { title, body } = req.body
    const post = await forumService.updatePost(id, userId, title, body)
    res.json(post)
  } catch (err) {
    console.error("editPost error:", err)
    res.status(500).json({ error: "Failed to edit post" })
  }
}

export const removePost = async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    await forumService.deletePost(id, userId)
    res.json({ success: true })
  } catch (err) {
    console.error("removePost error:", err)
    res.status(500).json({ error: "Failed to delete post" })
  }
}

export const editComment = async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    const { body } = req.body

    const comment = await forumService.updateComment(id, userId, body)
    res.json(comment)
  } catch (err) {
    console.error("editComment error:", err)
    res.status(500).json({ error: "Failed to edit comment" })
  }
}

export const removeComment = async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params

    await forumService.deleteComment(id, userId)
    res.json({ success: true })
  } catch (err) {
    console.error("removeComment error:", err)
    res.status(500).json({ error: "Failed to delete comment" })
  }
}