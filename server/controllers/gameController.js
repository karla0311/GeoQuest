import * as gameService from "../services/gameService.js"

export const getLastResult = async (req, res) => {
  try {
    const result = await gameService.getLastResult(req.user.id)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch last result" })
  }
}

export const getRecentResults = async (req, res) => {
  try {
    const results = await gameService.getRecentResults(req.user.id)
    res.json(results)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch recent results" })
  }
}

export const submitResult = async (req, res) => {
  const { score, stage, time_taken, accuracy, country } = req.body

  const isValid =
    Number.isInteger(score) && score >= 0 &&
    Number.isInteger(stage) && stage >= 1 &&
    Number.isInteger(time_taken) && time_taken >= 0 &&
    Number.isInteger(accuracy) && accuracy >= 0 && accuracy <= 100

  if (!isValid) {
    return res.status(400).json({ error: "Invalid result data" })
  }

  // country is optional but if provided has to be a reasonable string
  if (country !== undefined) {
    if (typeof country !== "string" || country.trim() === "" || country.length > 100) {
      return res.status(400).json({ error: "Invalid country" })
    }
  }

  try {
    const userId = req.user.id
    const result = await gameService.saveResult(userId, {
      score, stage, time_taken, accuracy,
      country: country ? country.trim() : undefined,
    })
    res.status(201).json(result)
  } catch (err) {
    res.status(500).json({ error: "Failed to save result" })
  }
}

export const getResultById = async (req, res) => {
  try {
    const result = await gameService.getResultById(req.params.id, req.user.id)
    if (!result) return res.status(404).json({ error: "Not found" })
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch result" })
  }
}

export const getAllResults = async (req, res) => {
  try {
    const results = await gameService.getAllResults(req.user.id)
    res.json(results)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history" })
  }
}
