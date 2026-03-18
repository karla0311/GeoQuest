import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";
import forumRoutes from "./routes/forumRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { limiter } from "./middleware/rateLimiter.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(morgan("dev"));
app.use(express.json());
app.use(limiter);

app.use("/auth", authRoutes);
app.use("/game", gameRoutes);
app.use("/forum", forumRoutes);
app.use("/stats", statsRoutes);
app.use("/leaderboard", leaderboardRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use(errorHandler);

export default app;
