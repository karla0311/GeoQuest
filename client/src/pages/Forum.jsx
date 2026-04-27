import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { getPosts, createPost, votePost, deletePost, updatePost, addComment } from "../api/forumService"

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
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl w-full max-w-lg p-6 flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-white">New Post</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 uppercase tracking-wider">Title</label>
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your question or insight?"
              className="w-full px-4 py-2.5 bg-zinc-700 border border-zinc-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 uppercase tracking-wider">Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share your thoughts, tips, or questions..."
              rows={5}
              className="w-full px-4 py-2.5 bg-zinc-700 border border-zinc-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 border border-zinc-600 rounded-lg hover:text-white hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim() || !body.trim()}
              className="px-5 py-2 text-sm font-medium bg-emerald-700 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl w-full max-w-lg p-6 flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-white">Edit Post</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 uppercase tracking-wider">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-700 border border-zinc-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 uppercase tracking-wider">Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              className="w-full px-4 py-2.5 bg-zinc-700 border border-zinc-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-400 border border-zinc-600 rounded-lg hover:text-white hover:bg-zinc-700 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={!title.trim() || !body.trim()} className="px-5 py-2 text-sm font-medium bg-emerald-700 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Post card ─────────────────────────────────────────────────────────────────
function PostCard({ post, currentUser, onVote, onDelete, onEdit, onComment }) {
  const isNew = (Date.now() - new Date(post.created_at)) / 1000 < 3600
  const isOwner = currentUser?.id === post.user_id

  const comments = Array.isArray(post.forum_comments) ? post.forum_comments : []
  const votes = Array.isArray(post.forum_votes) ? post.forum_votes : []
  const voteCount = votes.length
  const hasVoted = votes.some((v) => v.user_id === currentUser?.id)

  const [comment, setComment] = useState("")
  const [showComments, setShowComments] = useState(false)
  const [showCommentBox, setShowCommentBox] = useState(false)

  const handleCommentSubmit = () => {
    if (!comment.trim()) return
    onComment(post.id, comment.trim())
    setComment("")
    setShowCommentBox(false)
    setShowComments(true)
  }

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5 hover:border-zinc-500 transition-colors">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-emerald-900 flex items-center justify-center text-emerald-400 text-xs font-semibold flex-shrink-0 mt-0.5">
          {(post.profiles?.username ?? post.user_id ?? "?")[0].toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-base font-semibold text-white leading-snug">{post.title}</h3>
            {isNew && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-400 border border-emerald-800 flex-shrink-0">
                NEW
              </span>
            )}
          </div>

          {/* Body */}
          <p className="text-sm text-gray-400 leading-relaxed line-clamp-2 mb-3">{post.body}</p>

          {/* Meta */}
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
            <span>{post.profiles?.username ?? "anonymous"}</span>
            <span>·</span>
            <span>{timeAgo(post.created_at)}</span>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">

            {/* 👍 Upvote — toggles, highlights if already voted */}
            <button
              onClick={() => onVote(post.id)}
              className={`flex items-center gap-1 transition-colors ${
                hasVoted ? "text-emerald-400" : "hover:text-emerald-400"
              }`}
            >
              👍 <span>{voteCount}</span>
            </button>

            {/* 💬 Toggle comments */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              💬 <span>{comments.length}</span>
            </button>

            {/* ✏️ Reply */}
            <button
              onClick={() => { setShowCommentBox(!showCommentBox); setShowComments(true) }}
              className="hover:text-blue-400 transition-colors"
            >
              ↩ Reply
            </button>

            {/* ✏️ Edit (owner only) */}
            {isOwner && (
              <button onClick={() => onEdit(post)} className="hover:text-yellow-400 transition-colors">
                ✏️ Edit
              </button>
            )}

            {/* 🗑 Delete (owner only) */}
            {isOwner && (
              <button onClick={() => onDelete(post.id)} className="hover:text-red-400 transition-colors">
                🗑 Delete
              </button>
            )}
          </div>

          {/* COMMENT INPUT */}
          {showCommentBox && (
            <div className="mt-3 flex gap-2">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCommentSubmit()}
                placeholder="Write a comment..."
                className="flex-1 px-3 py-1.5 bg-zinc-700 border border-zinc-600 rounded text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
              <button
                onClick={handleCommentSubmit}
                disabled={!comment.trim()}
                className="px-3 py-1.5 bg-emerald-700 text-white text-xs rounded hover:bg-emerald-600 disabled:opacity-40"
              >
                Post
              </button>
            </div>
          )}

          {/* COMMENTS LIST */}
          {showComments && comments.length > 0 && (
            <div className="mt-4 flex flex-col gap-2 border-t border-zinc-700 pt-3">
              {comments
                .slice()
                .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                .map((c) => (
                  <div key={c.id} className="flex items-start gap-2">
                    {/* Comment avatar */}
                    <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-gray-400 text-[10px] font-semibold flex-shrink-0 mt-0.5">
                      ?
                    </div>
                    <div className="flex-1 bg-zinc-700/50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-medium text-gray-300">anonymous</span>
                        <span className="text-[10px] text-gray-500">{timeAgo(c.created_at)}</span>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">{c.body}</p>
                    </div>
                  </div>
                ))}
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
    <div className="min-h-screen bg-zinc-900 text-white">

      {/* Navbar */}
      <nav className="bg-zinc-800 px-8 py-4 flex justify-between items-center border-b border-zinc-700">
        <h1 className="text-2xl font-bold text-emerald-700">GeoQuest</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-300">Welcome, {user?.email ?? "Player"}</span>
          <button onClick={() => navigate("/dashboard")} className="bg-zinc-700 text-white px-4 py-2 rounded-lg hover:bg-zinc-600">
            Dashboard
          </button>
          <button onClick={handleLogout} className="px-4 py-2 border border-zinc-600 rounded-lg text-gray-300 hover:bg-zinc-700">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10 flex gap-8">

        {/* ── Left: posts column ── */}
        <div className="flex-1 min-w-0">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Community Forum</h2>
              <p className="text-gray-400 text-sm mt-1">Share strategies, tips, and geography insights.</p>
            </div>
            <button
              onClick={() => setComposeOpen(true)}
              className="bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-emerald-600 text-sm flex-shrink-0"
            >
              + New Post
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-zinc-700 mb-4">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  activeTab === tab ? "text-emerald-400 border-emerald-500" : "text-gray-400 border-transparent hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {tagFilter && (
            <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
              Filtered by: <span className="text-emerald-400 font-medium">#{tagFilter}</span>
              <button onClick={() => setTagFilter(null)} className="text-xs bg-zinc-700 hover:bg-zinc-600 px-2 py-0.5 rounded text-gray-300">
                ✕ Clear
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

          <div className="flex flex-col gap-3">
            {displayedPosts.length === 0 && !fetchError ? (
              <div className="text-center py-16 text-gray-500">
                <p className="text-lg mb-1">No posts yet.</p>
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
                />
              ))
            )}
          </div>
        </div>

        {/* ── Right: sidebar ── */}
        <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col gap-6">
          <div className="bg-zinc-800 rounded-xl p-5 border border-zinc-700">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    tagFilter === tag
                      ? "bg-emerald-900/60 border-emerald-700 text-emerald-400"
                      : "bg-zinc-700 border-zinc-600 text-gray-400 hover:border-zinc-500 hover:text-gray-200"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-zinc-800 rounded-xl p-5 border border-zinc-700">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Community</h3>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Total posts</span>
                <span className="text-sm font-medium text-white">{posts.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Total comments</span>
                <span className="text-sm font-medium text-white">
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