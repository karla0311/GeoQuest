import axios from "axios";
import { supabase } from "../context/AuthContext";

const API = axios.create({
  baseURL: "http://localhost:8000",
});

API.interceptors.request.use(async (req) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    req.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return req;
});

export default API;