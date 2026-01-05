function mapServiceErrors(err, req, res, next) {
  // Map service errors to HTTP status codes
  if (err.message.includes('already exists')) {
    err.status = 409;
  } else if (err.message.includes('not found')) {
    err.status = 404;
  } else if (err.message.includes('Invalid')) {
    err.status = 400;
  } else if (!err.status) {
    err.status = 500;
  }

  next(err);
}

export { mapServiceErrors };
