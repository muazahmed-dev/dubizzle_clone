const AppError = require("./../utils/appError");

// INVALID FIELDS VALUE
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

// DUPLICATE ERROR
const handleDuplicateFieldsDB = (err) => {
  const key = Object.keys(err.keyValue)[0];
  const message = `${key} already exists, try another value.`;
  return new AppError(message, 409);
};

// VALIDATION ERROR 
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

// INVALID JWT
const handleJWTError = () => new AppError("Invalid token. Login again", 401);

// TOKEN EXPIRATION
const hanldeJWTExpireError = () =>
  new AppError("Your token has been expired! please log in again", 401);

// DEVELOPMENT ERROR
const devError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// PRODUCTION ERROR
const prodError = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("ERROR", err);

    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};

// GLOBAL ERROR HANDLER
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "fail";

  if (process.env.NODE_ENV === "development") {
    devError(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;

    if (err.name === "CastError") error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === "ValidationError") error = handleValidationErrorDB(error);
    if (err.name === "JsonWebTokenError") error = handleJWTError(error);
    if (err.name === "TokenExpiredError") error = hanldeJWTExpireError(error);

    prodError(error, res);
  }
};
