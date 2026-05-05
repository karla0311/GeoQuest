import supabase from "../config/supabaseClient.js";

const SESSION_GAP = 15 * 60 * 1000;

// ✅ helper → get start of TODAY (UTC-safe)
function getStartOfToday() {
  const now = new Date();
  return new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  ));
}

// ── GROUP DAILY SESSIONS ─────────────────────────────────────
function groupSessions(rows) {
  const sessions = [];

  rows.forEach(row => {
    const time = new Date(row.played_at).getTime();

    let session = sessions.find(
      s =>
        Math.abs(s.latest - time) < SESSION_GAP &&
        s.user_id === row.user_id
    );

    if (!session) {
      session = {
        user_id: row.user_id,
        username: row.profiles?.username || "Player",
        rows: [],
        latest: time,
      };
      sessions.push(session);
    }

    session.rows.push(row);
    session.latest = Math.max(session.latest, time);
  });

  return sessions.map(s => {
    const total_score = s.rows.reduce((sum, r) => sum + r.score, 0);
    const total_time = s.rows.reduce((sum, r) => sum + r.time_taken, 0);
    const avg_accuracy =
      s.rows.reduce((sum, r) => sum + r.accuracy, 0) / s.rows.length;

    return {
      user_id: s.user_id,
      username: s.username,
      total_score,
      total_time,
      avg_accuracy,
    };
  });
}

// ── MAIN LEADERBOARD LOGIC ───────────────────────────────────
export async function getLeaderboard(is_daily) {
  let query = supabase
    .from("game_results")
    .select(`
      user_id,
      score,
      time_taken,
      accuracy,
      played_at,
      is_daily,
      profiles (username)
    `)
    .eq("is_daily", is_daily);

  // 🔥🔥🔥 CRITICAL FIX → ONLY TODAY FOR DAILY MODE
  if (is_daily) {
    const startOfToday = getStartOfToday().toISOString();
    query = query.gte("played_at", startOfToday);
  }

  const { data, error } = await query;

  if (error) throw error;

  let leaderboardData;

  if (is_daily) {
    leaderboardData = groupSessions(data);
  } else {
    // PRACTICE MODE → aggregate per user
    const map = {};

    data.forEach(row => {
      const username = row.profiles?.username || "Player";

      if (!map[row.user_id]) {
        map[row.user_id] = {
          user_id: row.user_id,
          username,
          total_score: 0,
          total_time: 0,
          total_accuracy: 0,
          games: 0,
        };
      }

      map[row.user_id].total_score += row.score;
      map[row.user_id].total_time += row.time_taken;
      map[row.user_id].total_accuracy += row.accuracy;
      map[row.user_id].games += 1;
    });

    leaderboardData = Object.values(map).map(u => ({
      user_id: u.user_id,
      username: u.username,
      total_score: u.total_score,
      total_time: u.total_time,
      avg_accuracy: u.total_accuracy / u.games,
    }));
  }

  const sorted = leaderboardData.sort((a, b) => {
    if (b.total_score !== a.total_score)
      return b.total_score - a.total_score;

    if (is_daily && a.total_time !== b.total_time)
      return a.total_time - b.total_time;

    return b.avg_accuracy - a.avg_accuracy;
  });

  return sorted.map((entry, index) => ({
    rank: index + 1,
    ...entry,
  }));
}

// ── TOP 10 ───────────────────────────────────────────────────
export async function getTop10(is_daily) {
  const leaderboard = await getLeaderboard(is_daily);
  return leaderboard.slice(0, 10);
}

// ── USER RANK ────────────────────────────────────────────────
export async function getUserRank(user_id, is_daily) {
  const leaderboard = await getLeaderboard(is_daily);
  return leaderboard.find(entry => entry.user_id === user_id);
}