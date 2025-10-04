export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function errorMiddleware(err, req, res, next) {
  if (res.headersSent) return next(err);
  const status = err.status || 500;
  const payload = {
    error: err.message || 'Internal Server Error'
  };
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    payload.stack = err.stack;
  }
  res.status(status).json(payload);
}
