import API from "./api"

export const submitGameResult = async (payload) => {
  const res = await API.post("/game/result", payload)
  return res.data
}

export const getLastGameResult = async () => {
  const res = await API.get("/game/last")
  return res.data
}

export const getRecentGames = async () => {
  const res = await API.get("/game/recent")
  return res.data
}

export const getGameById = async (id) => {
  const res = await API.get(`/game/${id}`)
  return res.data
}

export const getGameHistory = async () => {
  const res = await API.get("/game/history")
  return res.data
}
