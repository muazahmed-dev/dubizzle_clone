const Job = require("../models/jobModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sharp = require("sharp");
const cloudinary = require("../utils/cloudinaryConfig");
const { Readable } = require("stream");

// UPLOAD IMAGE BUFFER TO CLOUDINARY USING STREAMS
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "image" },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // CONVERT BUFFER TO STREAMS
    const readable = new Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null); // END OF STREAM

    // PIPE THE STREAM TO CLOUDINARY
    readable.pipe(uploadStream);
  });
};

// CREATE JOB
exports.createJob = catchAsync(async (req, res, next) => {
  const {
    title,
    description,
    experienceRequired,
    salary,
    skillsRequired,
    jobType,
    country,
    city,
    currency,
    category,
    designation,
    email,
    contact,
  } = req.body;

  if (!req.files || req.files.length === 0) {
    return next(new AppError("No images uploaded", 400));
  }

  // COMPRESS IMAGE
  const uploadPromises = req.files.map(async (file) => {
    const compressedImageBuffer = await sharp(file.buffer)
      .resize({ width: 800 }) // RESIZING IMAGE
      .toBuffer();

    // UPLOAD IMAGE TO CLOUDINARY
    const result = await uploadToCloudinary(compressedImageBuffer);

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  });

  const uploadedImages = await Promise.all(uploadPromises);

  const job = await Job.create({
    user: req.user.id,
    title,
    description,
    experienceRequired,
    salary,
    skillsRequired,
    jobType,
    country,
    city,
    price,
    currency,
    category,
    designation,
    email,
    contact,
    images: uploadedImages,
  });

  res.status(201).json({
    status: "success",
    job,
  });
});

// GET ALL JOB
exports.getAllJobs = catchAsync(async (req, res, next) => {
  const jobs = await Job.find();

  if (jobs.length === 0) {
    return next(new AppError("No jobs found", 404));
  }

  res.status(200).json({
    status: "success",
    results: jobs.length,
    jobs,
  });
});

// GET ONE JOB
exports.getJob = catchAsync(async (req, res, next) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    return next(new AppError("No job found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    job,
  });
});

// UPDATE JOB
exports.updateJobFields = catchAsync(async (req, res, next) => {
  const jobId = req.params.id;

  const job = await Job.findByIdAndUpdate(jobId, req.body, {
    new: true,
    runValidators: true,
  });

  if (!job) {
    return next(new AppError("No job found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    job,
  });
});

// ADD NEW IMAGE OR DELETE IMAGE
exports.updateJobImages = catchAsync(async (req, res, next) => {
  const jobId = req.params.id;

  const job = await Job.findById(jobId);
  if (!job) {
    return next(new AppError("No job found with that ID", 404));
  }

  // UPLOAD IMAGE IF PROVIDED
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map(async (file) => {
      const compressedImageBuffer = await sharp(file.buffer)
        .resize({ width: 800 })
        .toBuffer();

      const result = await uploadToCloudinary(compressedImageBuffer);

      return {
        url: result.secure_url,
        public_id: result.public_id,
      };
    });

    const uploadedImages = await Promise.all(uploadPromises);
    job.images.push(...uploadedImages);
  }

  // DELETE IMAGE IF PROVIDED
  if (req.body.deleteImages) {
    const imagesToDelete = req.body.deleteImages;
    await cloudinary.api.delete_resources(imagesToDelete, {
      type: "upload",
      resource_type: "image",
    });

    imagesToDelete.forEach(async (public_id) => {
      job.images = job.images.filter((image) => image.public_id !== public_id);
    });
  }

  await job.save();

  res.status(200).json({
    status: "success",
    job,
  });
});

// DELETE JOB
exports.deleteJob = catchAsync(async (req, res, next) => {
  const job = await Job.findByIdAndDelete(req.params.id);

  if (!job) {
    return next(new AppError("No job found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
  });
});
