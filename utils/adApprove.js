const Product = require("../models/productModel");
const Job = require("../models/jobModel");
const catchAsync = require("./catchAsync");
const AppError = require("./appError");

module.exports = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const ad = (await Product.findById(id)) ?? (await Job.findById(id));

  if (!ad) {
    return next(new AppError("No ad found with that ID", 404));
  }

  ad.isApproved = true;
  ad.status = "active";
  ad.duration = 30;

  ad.save();

  res.status(200).json({
    status: "sucess",
    message: "Ad approved successfully",
  });
});
