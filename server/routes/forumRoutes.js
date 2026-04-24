import { Router } from "express";
import { getPosts, createPost } from "../controllers/forumController.js"
import { requireAuth } from "../middleware/authMiddleware.js"

const router = Router();

router.get("/", getPosts)
router.post("/", requireAuth, createPost)

// GET    /forum/posts
// POST   /forum/posts
// POST   /forum/reply
// DELETE /forum/posts/:id

export default router;
