import API from "./api"

export const submitGameResult = async (payload) => {
  const res = await API.post("/game/result", payload)
  return res.data
}
