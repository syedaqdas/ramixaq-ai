export const notFound = (req, res, next) => {
  const error = new Error(`Not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const uploadStatus =
    err.code === "LIMIT_FILE_SIZE" ? 413 : /Only PDF|must be JPG|PNG|WebP/i.test(err.message || "") ? 400 : null;
  const statusCode = uploadStatus || (res.statusCode === 200 ? 500 : res.statusCode);

  res.status(statusCode).json({
    message: err.message || "Server error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack
  });
};
