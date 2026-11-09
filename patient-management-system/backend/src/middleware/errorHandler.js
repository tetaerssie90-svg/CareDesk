export function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error.code === '23505') {
    return res.status(409).json({ success: false, message: 'A record with one of these unique values already exists.' });
  }
  if (error.code === '23503') {
    return res.status(400).json({ success: false, message: 'A related record does not exist or is still in use.' });
  }
  console.error(error);
  res.status(500).json({ success: false, message: 'An unexpected server error occurred.' });
}
