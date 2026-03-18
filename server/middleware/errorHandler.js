export function errorHandler(err, req, res, next) {
  const status = err.status || 500;

  if (status >= 500) {
    console.error(err.stack);
    return res.status(status).json({ error: "Internal server error" });
  }

  res.status(status).json({ error: err.message || "Request failed" });
}
