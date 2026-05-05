import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import StarFieldBackground from "../components/Backgrounds/StarFieldBackground"
import BrandLogo from "../components/BrandLogo"
import { getPosts, createPost, votePost, deletePost, updatePost, addComment, updateComment, deleteComment } from "../api/forumService"
import { Sparkles, ThumbsUp, MessageSquare, Reply, Edit3, Trash2, Tag, BarChart3, Rocket, MessageCircle, Check, X } from "lucide-react"

const TABS = ["Latest", "Hot", "Unanswered"]
const POPULAR_TAGS = ["flags", "capitals", "strategy", "daily-challenge", "tips", "map-stage"]

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60) return "just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// ── Compose modal ─────────────────────────────────────────────────────────────
function ComposeModal({ open, onClose, onSubmit, loading }) {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const titleRef = useRef(null)

  useEffect(() => {
    if (open) setTimeout(() => titleRef.current?.focus(), 50)
  }, [open])

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return
    onSubmit({ title: title.trim(), body: body.trim() })
    setTitle("")
    setBody("")
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl w-full max-w-lg p-8 flex flex-col gap-4 shadow-2xl">
        <h2 className="text-2xl font-bold text-white font-fraunces">New Post</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Title</label>
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your question or insight?"
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share your thoughts, tips, or questions..."
              rows={5}
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm resize-none transition-colors"
            />
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-gray-400 border border-white/20 rounded-lg hover:text-white hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim() || !body.trim()}
              className="px-5 py-2.5 text-sm font-semibold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Edit modal ────────────────────────────────────────────────────────────────
function EditModal({ open, post, onClose, onSubmit }) {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")

  useEffect(() => {
    if (post) { setTitle(post.title); setBody(post.body) }
  }, [post])

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return
    onSubmit(post.id, { title: title.trim(), body: body.trim() })
  }

  if (!open || !post) return null

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl w-full max-w-lg p-8 flex flex-col gap-4 shadow-2xl">
        <h2 className="text-2xl font-bold text-white font-fraunces">Edit Post</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm resize-none transition-colors"
            />
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-gray-400 border border-white/20 rounded-lg hover:text-white hover:bg-white/10 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={!title.trim() || !body.trim()} className="px-5 py-2.5 text-sm font-semibold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Post card ─────────────────────────────────────────────────────────────────
function PostCard({ post, currentUser, onVote, onDelete, onEdit, onComment, onEditComment, onDeleteComment }) {
  const isNew = (Date.now() - new Date(post.created_at)) / 1000 < 3600
  const isOwner = currentUser?.id === post.user_id

  const comments = Array.isArray(post.forum_comments) ? post.forum_comments : []
  const votes = Array.isArray(post.forum_votes) ? post.forum_votes : []
  const voteCount = votes.length
  const hasVoted = votes.some((v) => v.user_id === currentUser?.id)

  const [comment, setComment] = useState("")
  const [showComments, setShowComments] = useState(false)
  const [showCommentBox, setShowCommentBox] = useState(false)

  // Track which comment is being edited and its draft text
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingCommentText, setEditingCommentText] = useState("")

  const handleCommentSubmit = () => {
    if (!comment.trim()) return
    onComment(post.id, comment.trim())
    setComment("")
    setShowCommentBox(false)
    setShowComments(true)
  }

  const handleEditCommentStart = (c) => {
    setEditingCommentId(c.id)
    setEditingCommentText(c.body)
  }

  const handleEditCommentSave = (commentId) => {
    if (!editingCommentText.trim()) return
    onEditComment(commentId, editingCommentText.trim())
    setEditingCommentId(null)
    setEditingCommentText("")
  }

  const handleEditCommentCancel = () => {
    setEditingCommentId(null)
    setEditingCommentText("")
  }

  return (
    <div className="bg-black/25 backdrop-blur-md border border-white/10 rounded-xl p-5 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all duration-300">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-emerald-500/60 flex items-center justify-center text-emerald-400 text-sm font-bold flex-shrink-0 mt-0.5">
          {(post.profiles?.username ?? post.user_id ?? "?")[0].toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-base font-semibold text-white leading-snug">{post.title}</h3>
            {isNew && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded bg-emerald-500/50 text-emerald-400 border border-emerald-500/40 flex-shrink-0">
                <Sparkles className="text-yellow-400" size={10} />
                NEW
              </span>
            )}
          </div>

          {/* Body */}
          <p className="text-sm text-gray-300 leading-relaxed line-clamp-2 mb-3">{post.body}</p>

          {/* Meta */}
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
            <span className="text-gray-400 font-medium">{post.profiles?.username ?? "anonymous"}</span>
            <span>•</span>
            <span>{timeAgo(post.created_at)}</span>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">

            {/* 👍 Upvote */}
            <button
              onClick={() => onVote(post.id)}
              className={`flex items-center gap-1.5 transition-all ${
                hasVoted ? "text-emerald-400 font-semibold" : "hover:text-emerald-400"
              }`}
            >
              <ThumbsUp size={14} fill={hasVoted ? "currentColor" : "none"} />
              <span>{voteCount}</span>
            </button>

            {/* 💬 Toggle comments */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <MessageSquare size={14} />
              <span>{comments.length}</span>
            </button>

            {/* ↩ Reply */}
            <button
              onClick={() => { setShowCommentBox(!showCommentBox); setShowComments(true) }}
              className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
            >
              <Reply size={14} />
              <span>Reply</span>
            </button>

            {/* ✏️ Edit post (owner only) */}
            {isOwner && (
              <button onClick={() => onEdit(post)} className="hover:text-yellow-400 transition-colors flex items-center gap-1.5">
                <Edit3 size={14} />
                <span>Edit</span>
              </button>
            )}

            {/* 🗑 Delete post (owner only) */}
            {isOwner && (
              <button onClick={() => onDelete(post.id)} className="hover:text-red-400 transition-colors flex items-center gap-1.5">
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            )}
          </div>

          {/* COMMENT INPUT */}
          {showCommentBox && (
            <div className="mt-4 flex gap-2">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCommentSubmit()}
                placeholder="Write a comment..."
                className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
              <button
                onClick={handleCommentSubmit}
                disabled={!comment.trim()}
                className="px-4 py-2 bg-emerald-500 text-white text-sm font-semibold rounded hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Post
              </button>
            </div>
          )}

          {/* COMMENTS LIST */}
          {showComments && comments.length > 0 && (
            <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-3">
              {comments
                .slice()
                .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                .map((c) => {
                  const isCommentOwner = currentUser?.id === c.user_id
                  const isEditing = editingCommentId === c.id

                  return (
                    <div key={c.id} className="flex items-start gap-2">
                      {/* Comment avatar */}
                      <div className="w-6 h-6 rounded-full bg-emerald-500/40 flex items-center justify-center text-gray-400 text-[10px] font-semibold flex-shrink-0 mt-0.5">
                        {(c.profiles?.username ?? "?")[0].toUpperCase()}
                      </div>
                      <div className="flex-1 bg-black/20 border border-white/5 rounded-lg px-3 py-2">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-300">{c.profiles?.username ?? "anonymous"}</span>
                            <span className="text-[10px] text-gray-500">{timeAgo(c.created_at)}</span>
                          </div>

                          {/* Comment edit/delete controls (comment owner only) */}
                          {isCommentOwner && !isEditing && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditCommentStart(c)}
                                className="text-[10px] text-gray-500 hover:text-yellow-400 transition-colors flex items-center gap-1"
                              >
                                <Edit3 size={10} />
                                Edit
                              </button>
                              <button
                                onClick={() => onDeleteComment(c.id)}
                                className="text-[10px] text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1"
                              >
                                <Trash2 size={10} />
                                Delete
                              </button>
                            </div>
                          )}

                          {/* Save/cancel when editing */}
                          {isEditing && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditCommentSave(c.id)}
                                disabled={!editingCommentText.trim()}
                                className="text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 disabled:opacity-40"
                              >
                                <Check size={10} />
                                Save
                              </button>
                              <button
                                onClick={handleEditCommentCancel}
                                className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1"
                              >
                                <X size={10} />
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Comment body or edit input */}
                        {isEditing ? (
                          <input
                            autoFocus
                            value={editingCommentText}
                            onChange={(e) => setEditingCommentText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleEditCommentSave(c.id)
                              if (e.key === "Escape") handleEditCommentCancel()
                            }}
                            className="w-full mt-1 px-2 py-1 bg-black/40 border border-emerald-500/40 rounded text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                          />
                        ) : (
                          <p className="text-xs text-gray-300 leading-relaxed">{c.body}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>
          )}

          {/* Empty comments state */}
          {showComments && comments.length === 0 && (
            <p className="mt-3 text-xs text-gray-500 italic">No comments yet. Be the first!</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Forum page ───────────────────────────────────────────────────────────
export default function Forum() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [posts, setPosts] = useState([])
  const [fetchError, setFetchError] = useState(null)
  const [activeTab, setActiveTab] = useState("Latest")
  const [tagFilter, setTagFilter] = useState(null)
  const [composeOpen, setComposeOpen] = useState(false)
  const [postLoading, setPostLoading] = useState(false)
  const [postError, setPostError] = useState(null)
  const [editTarget, setEditTarget] = useState(null)

  async function loadPosts() {
    setFetchError(null)
    try {
      const data = await getPosts()
      setPosts(data ?? [])
    } catch {
      setFetchError("Failed to load posts. Please try again.")
    }
  }

  useEffect(() => { loadPosts() }, [])

  async function handleNewPost({ title, body }) {
    setPostLoading(true)
    setPostError(null)
    try {
      await createPost({ title, body })
      setComposeOpen(false)
      loadPosts()
    } catch {
      setPostError("Failed to create post. Please try again.")
    } finally {
      setPostLoading(false)
    }
  }

  async function handleVote(postId) {
    try {
      await votePost(postId)
      loadPosts()
    } catch {
      console.error("Vote failed")
    }
  }

  async function handleDelete(postId) {
    try {
      await deletePost(postId)
      loadPosts()
    } catch {
      console.error("Delete failed")
    }
  }

  async function handleEditSubmit(postId, { title, body }) {
    try {
      await updatePost(postId, { title, body })
      setEditTarget(null)
      loadPosts()
    } catch {
      console.error("Edit failed")
    }
  }

  async function handleComment(postId, body) {
    try {
      await addComment(postId, body)
      loadPosts()
    } catch {
      console.error("Comment failed")
    }
  }

  async function handleEditComment(commentId, body) {
    try {
      await updateComment(commentId, body)
      loadPosts()
    } catch {
      console.error("Edit comment failed")
    }
  }

  async function handleDeleteComment(commentId) {
    try {
      await deleteComment(commentId)
      loadPosts()
    } catch {
      console.error("Delete comment failed")
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const sortedPosts = [...posts].sort((a, b) => {
    if (activeTab === "Latest") return new Date(b.created_at) - new Date(a.created_at)
    if (activeTab === "Hot") return (b.forum_votes?.length ?? 0) - (a.forum_votes?.length ?? 0)
    if (activeTab === "Unanswered") return (a.forum_comments?.length ?? 0) - (b.forum_comments?.length ?? 0)
    return 0
  })

  const displayedPosts = tagFilter
    ? sortedPosts.filter((p) =>
        p.title?.toLowerCase().includes(tagFilter) || p.body?.toLowerCase().includes(tagFilter)
      )
    : sortedPosts

  return (
    <div className="min-h-screen bg-transparent text-white">
      <StarFieldBackground />

      {/* Navbar */}
      <nav className="relative z-10 bg-black/30 backdrop-blur-md px-8 py-4 flex justify-between items-center border-b border-white/10">
        <BrandLogo />
        <div className="flex items-center gap-4">
          <span className="text-gray-300 text-sm">Welcome, <span className="text-emerald-400 font-semibold">{user?.user_metadata?.username ?? user?.email?.split('@')[0] ?? "Player"}</span></span>
          <button onClick={() => navigate("/dashboard")} className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-all duration-200">Dashboard</button>
          <button onClick={handleLogout} className="px-4 py-2 border border-emerald-500/50 text-gray-300 rounded-lg text-sm hover:bg-emerald-500/20 transition-all duration-200">Logout</button>
        </div>
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10 flex gap-8">

        {/* ── Left: posts column ── */}
        <div className="flex-1 min-w-0">

          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white font-fraunces flex items-center gap-3">
                <MessageCircle className="text-emerald-400" size={32} />
                Community Forum</h2>
              <p className="text-gray-400 text-sm mt-2">Share strategies, tips, and geography insights.</p>
            </div>
            <button
              onClick={() => setComposeOpen(true)}
              className="bg-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-all duration-200 transform hover:scale-105 text-sm flex-shrink-0"
            >
              New Post
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-emerald-500 text-white shadow-lg"
                    : "bg-black/20 text-gray-400 border border-white/10 hover:text-white hover:border-emerald-500/50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {tagFilter && (
            <div className="flex items-center gap-2 mb-4 text-sm text-gray-300 bg-emerald-500/20 border border-emerald-500/30 rounded-lg px-4 py-2 w-fit">
              <Tag size={14} className="text-emerald-400" />
              <span className="text-emerald-400 font-medium">{tagFilter}</span>
              <button onClick={() => setTagFilter(null)} className="ml-2 text-xs bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded transition-colors">
                ✕
              </button>
            </div>
          )}

          {postError && (
            <div className="mb-4 px-4 py-3 bg-red-900/40 border border-red-800 rounded-lg text-red-300 text-sm">{postError}</div>
          )}

          {fetchError && (
            <div className="mb-4 px-4 py-3 bg-red-900/40 border border-red-800 rounded-lg text-red-300 text-sm flex items-center justify-between">
              <span>{fetchError}</span>
              <button onClick={loadPosts} className="text-red-200 underline text-xs">Retry</button>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {displayedPosts.length === 0 && !fetchError ? (
              <div className="text-center py-16 text-gray-500 bg-black/20 border border-white/10 rounded-xl p-8">
                <Rocket size={48} className="text-gray-600 mb-4 opacity-70" />
                <p className="text-lg mb-2 font-fraunces">No posts yet.</p>
                <p className="text-sm">Be the first to start a discussion!</p>
              </div>
            ) : (
              displayedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={user}
                  onVote={handleVote}
                  onDelete={handleDelete}
                  onEdit={(post) => setEditTarget(post)}
                  onComment={handleComment}
                  onEditComment={handleEditComment}
                  onDeleteComment={handleDeleteComment}
                />
              ))
            )}
          </div>
        </div>

        {/* ── Right: sidebar ── */}
        <aside className="w-72 flex-shrink-0 hidden lg:flex flex-col gap-6">
          <div className="bg-black/25 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Tag size={16} className="text-emerald-500" />
              Popular Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-200 ${
                    tagFilter === tag
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "bg-black/40 border border-white/10 text-gray-400 hover:border-emerald-500/50 hover:text-gray-200"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-black/25 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <BarChart3 size={16} className="text-emerald-500" />
              Community
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Total posts</span>
                <span className="text-sm font-semibold text-emerald-400">{posts.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Total comments</span>
                <span className="text-sm font-semibold text-emerald-400">
                  {posts.reduce((sum, p) => sum + (p.forum_comments?.length ?? 0), 0)}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <ComposeModal
        open={composeOpen}
        onClose={() => { setComposeOpen(false); setPostError(null) }}
        onSubmit={handleNewPost}
        loading={postLoading}
      />

      <EditModal
        open={!!editTarget}
        post={editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={handleEditSubmit}
      />
    </div>
  )
}