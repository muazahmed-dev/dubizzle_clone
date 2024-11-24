const { promisify } = require("util");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const sendEmail = require("../utils/email");
const AppError = require("../utils/appError");

// GENERATE OTP
function OTP() {
  const randomNumber = Math.floor(100000 + Math.random() * 900000);
  return randomNumber;
}

// SIGN JWT
function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

// JWT CREATE AND SEND
function createAndSendToken(user, statusCode, res) {
  const token = signToken(user._id);

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    secure: process.env.NODE_ENV == "development" ? false : true,
    httpOnly: true,
  });

  res.status(statusCode).json({
    status: "success",
    token,
    user,
  });
}

//REGISTER
exports.sendOTP = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const otp = OTP();

  const user = await User.findOne({ email });

  if (user) {
    return next(new AppError("Email already exists", 400));
  }

  const message = `Dear User,\n\nThank you for registering with us! To complete your registration, please verify your email using the following One-Time Password (OTP):\n\nOTP: ${otp}\n\nThis OTP is valid for the next 10 minutes. Please do not share this code with anyone for security reasons.\n\nIf you did not request this OTP, please ignore this email or contact our support team immediately.\n\nBest regards,\nMaaz Ahmed\nSupport Team\n[maazahmed.tech@gmail.com]`;
  try {
    await sendEmail({
      email,
      subject: "Email Verification OTP",
      message,
    });

    //send otp in cookie
    res.cookie("otp", otp, {
      expires: new Date(Date.now() + 10 * 60 * 1000),
      secure: process.env.NODE_ENV === "development" ? false : true,
      httpOnly: true,
    });

    res.status(200).json({
      status: "success",
      message: "Email sent to user.",
    });
  } catch (err) {
    console.error(err.message);
    return next(new AppError("Error sending email, try again later", 500));
  }
});

// VERIFY EMAIL (COMPARING OTP AND CREATING USER)
exports.verifyEmail = catchAsync(async (req, res, next) => {
  const otpCookie = req.cookies.otp;
  const { otp, email, password, confirmPassword, name } = req.body;

  if (otp != otpCookie) {
    return next(new AppError("Invalid OTP", 401));
  }
  const user = await User.create({
    name,
    email,
    password,
    confirmPassword,
  });

  res.cookie("otp", "verified", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  createAndSendToken(user, 201, res);
});

//LOGIN
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email or password."));
  }

  const user = await User.findOne({ email });

  if (!user || !(await user.correctPassword(user.password, password))) {
    return next(new AppError("Invalid email or password.", 401));
  }
  createAndSendToken(user, 200, res);
});

// LOGOUT
exports.logout = catchAsync(async (req, res, next) => {
  res.cookie("jwt", "loggedOut", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ status: "success" });
});

// FORGET PASSWORD (SEND EMAIL)
exports.forgetPassword = catchAsync(async (req, res, next) => {
  const otp = OTP();
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new AppError("No user found with provided email address.", 404)
    );
  }

  const message = `Hello ${user.name}\n\nWe received a request to reset the password for your account. To complete the process, please use the OTP (One-Time Password) below:\n\nOTP: ${otp}\n\nThis OTP is valid for the next 10 minutes. If you did not request a password reset, please ignore this email.\n\nThank you,\nExpatriate Support Team`;

  try {
    await sendEmail({
      email: req.body.email,
      subject: "Password Reset Request",
      message,
    });

    //send otp in cookie
    res.cookie("otp", otp, {
      expires: new Date(Date.now() + 10 * 60 * 1000),
      secure: process.env.NODE_ENV === "development" ? false : true,
      httpOnly: true,
    });

    res.status(200).json({
      status: "success",
      message: "Email sent to user.",
    });
  } catch (err) {
    console.error(err.message);

    res.status(500).json({
      status: "error",
      msg: "Error sending email",
    });
  }
});

// VERIFY OTP FOR FORGET PASSWORD
exports.verifyOTP = catchAsync(async (req, res, next) => {
  const { otp } = req.body;

  if (otp != req.cookies.otp) {
    return next(new AppError("Invalid OTP", 401));
  }

  res.status(200).json({
    status: "success",
    message: "OTP verified.",
  });
});

// RESETING USER PASSWORD
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  user.password = password;

  await user.save();

  res.cookie("otp", "verified", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  createAndSendToken(user, 200, res);
});

// PROTECT MIDDLEWARE
exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else {
    return next(new AppError("Login to get access.", 401));
  }

  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  const user = await User.findById(decodedToken.id);

  if (!user) {
    return next(
      new AppError("User belonging to this token does not exists.", 401)
    );
  }

  req.user = user;
  next();
});

// AUTHORIZATION MIDDLEWARE
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You donot have permission to perform this action.", 403)
      );
    }
    next();
  };
};

// UPDATE PASSWORD
exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!(await user.correctPassword(user.password, req.body.currentPassword))) {
    return next(new AppError("Current password did not match.", 401));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;

  await user.save();

  createAndSendToken(user, 200, res);
});


