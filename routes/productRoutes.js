const express = require("express");
const productController = require("../controller/productController");
const authController = require("../controller/authController");
const multer = require("multer");
const adApprove = require("../utils/adApprove");

const router = express.Router();

// MULTER FOR FILE UPLOAD
const storage = multer.memoryStorage();
const upload = multer({ storage });

// PRODUCT ROUTES
router
  .route("/")
  .get(productController.getAllProducts)
  .post(
    authController.protect,
    upload.array("images", 10),
    productController.createProduct
  );

// FOR IMAGE UPLOAD OR DELETE
router.patch(
  "/:id/images",
  authController.protect,
  upload.array("images", 10),
  productController.updateProductImages
);

router
  .route("/:id")
  .get(productController.getProduct)
  .patch(authController.protect, productController.updateProductFields)
  .delete(authController.protect, productController.deleteProduct);

router.patch(
  "/approve-ad/:id",
  authController.protect,
  authController.restrictTo("admin"),
  adApprove
);

module.exports = router;
