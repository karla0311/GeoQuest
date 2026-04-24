import { Router } from "express";
import { getPosts, createPost, addComment, votePost, editPost, removePost } from "../controllers/forumController.js"
import { requireAuth } from "../middleware/authMiddleware.js"

const router = Router();

router.get("/", getPosts)
router.post("/", requireAuth, createPost)

router.post("/comment", requireAuth, addComment)
router.post("/vote", requireAuth, votePost)

router.put("/:id", requireAuth, editPost)
router.delete("/:id", requireAuth, removePost)

export default router;
