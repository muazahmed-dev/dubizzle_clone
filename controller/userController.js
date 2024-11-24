const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Product = require("../models/productModel");

// GET ALL USERS (ADMIN ONLY)
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  if (users.length == 0) {
    return next(new AppError("No users found", 404));
  }

  res.status(200).json({
    status: "success",
    results: users.length,
    users,
  });
});

// GET ONE USER
exports.getUser = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const user = await User.findById(id);

  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    user,
  });
});

// UPDATE USER
exports.updateUser = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const user = await User.findByIdAndUpdate(id, req.body, {
    runValidators: true,
    new: true,
  });

  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    user,
  });
});

// DELETE USER
exports.deleteUser = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
  });
});

// GET USER ADS
exports.myAds = catchAsync(async (req, res, next) => {
  const id = req.user.id;

  const ads = await Product.find({ user: id });

  if (ads.length == 0) {
    return next(new AppError("You currently have no ads.", 404));
  }

  res.status(200).json({
    status: "success",
    results: ads.length,
    ads,
  });
});
