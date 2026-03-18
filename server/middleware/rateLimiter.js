import rateLimit from "express-rate-limit";

// 100 requests per 15 min per IP
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
