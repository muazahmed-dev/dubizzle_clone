const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const userRouter = require("./routes/userRoutes");
const authRouter = require("./routes/authRoutes");
const productRouter = require("./routes/productRoutes");
const jobRouter = require("./routes/jobRoutes");
const errorHandler = require("./controller/errorController");

const app = express();

// MIDDLEWARES
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTES
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/products", productRouter);
app.use("/jobs", jobRouter);

// GLOBAL ERROR HANDLER
app.use(errorHandler);

module.exports = app;
