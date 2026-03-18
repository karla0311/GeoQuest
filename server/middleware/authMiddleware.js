import jwt from "jsonwebtoken";
import jwtConfig from "../config/jwtConfig.js";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = header.split(" ")[1];
  try {
    req.user = jwt.verify(token, jwtConfig.secret);
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
}
