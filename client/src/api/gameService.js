import API from "./api"

export const submitGameResult = async (payload) => {
  const res = await API.post("/game/result", payload)
  return res.data
}

export const getLastGameResult = async () => {
  const res = await API.get("/game/last")
  return res.data
}
