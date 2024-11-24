const Product = require("../models/productModel");
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

// CREATE PRODUCT
exports.createProduct = catchAsync(async (req, res, next) => {
  const {
    name,
    slogan,
    description,
    country,
    city,
    price,
    currency,
    category,
    subcategory,
    email,
    contact,
  } = req.body;

  console.log(req.files)

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

  const product = await Product.create({
    user: req.user.id,
    name,
    slogan,
    description,
    country,
    city,
    price,
    currency,
    category,
    subcategory,
    email,
    contact,
    images: uploadedImages,
  });

  res.status(201).json({
    status: "success",
    product,
  });
});

// GET ALL PRODUCTS
exports.getAllProducts = catchAsync(async (req, res, next) => {
  const products = await Product.find();

  if (products.length === 0) {
    return next(new AppError("No products found", 404));
  }

  res.status(200).json({
    status: "success",
    results: products.length,
    products,
  });
});

// GET ONE PRODUCT
exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError("No product found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    product,
  });
});

// UPDATE PRODUCT
exports.updateProductFields = catchAsync(async (req, res, next) => {
  const productId = req.params.id;

  const product = await Product.findByIdAndUpdate(productId, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return next(new AppError("No product found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    product,
  });
});

// ADD NEW IMAGE OR DELET IMAGE
exports.updateProductImages = catchAsync(async (req, res, next) => {
  const productId = req.params.id;

  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError("No product found with that ID", 404));
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
    product.images.push(...uploadedImages);
  }

  // DELETE IMAGE IF PROVIDED
  if (req.body.deleteImages) {
    const imagesToDelete = req.body.deleteImages;
    await cloudinary.api.delete_resources(imagesToDelete, {
      type: "upload",
      resource_type: "image",
    });

    imagesToDelete.forEach(async (public_id) => {
      product.images = product.images.filter(
        (image) => image.public_id !== public_id
      );
    });
  }

  await product.save();

  res.status(200).json({
    status: "success",
    product,
  });
});

// DELETE PRODUCT
exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return next(new AppError("No product found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
  });
});
