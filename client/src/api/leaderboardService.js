import axios from "axios";
import { supabase } from "../context/AuthContext";

const API_URL = "http://localhost:8000/leaderboard";

export async function getLeaderboard(is_daily) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const res = await axios.get(API_URL, {
    params: {
      is_daily,
      user_id: user?.id,
    },
  });

  return res.data;
}