import * as gameService from "../services/gameService.js"

export const getLastResult = async (req, res) => {
  try {
    const result = await gameService.getLastResult(req.user.id)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch last result" })
  }
}

export const submitResult = async (req, res) => {
  const { score, stage, time_taken, accuracy, is_daily } = req.body

  const isValid =
    Number.isInteger(score) && score >= 0 &&
    Number.isInteger(stage) && stage >= 1 &&
    Number.isInteger(time_taken) && time_taken >= 0 &&
    Number.isInteger(accuracy) && accuracy >= 0 && accuracy <= 100

  if (!isValid) {
    return res.status(400).json({ error: "Invalid result data" })
  }

  try {
    const userId = req.user.id
    const result = await gameService.saveResult(userId, { score, stage, time_taken, accuracy, is_daily })
    res.status(201).json(result)
  } catch (err) {
    res.status(500).json({ error: "Failed to save result" })
  }
}

export const checkDailyStatus = async (req, res) => {
  try {
    const status = await gameService.getDailyStatus(req.user.id);
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: "Failed to check daily status" });
  }
};
