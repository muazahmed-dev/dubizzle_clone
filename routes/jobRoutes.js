const express = require("express");
const jobController = require("../controller/jobController");
const authController = require("../controller/authController");
const multer = require("multer");

const router = express.Router();

// MULTER FOR FILE UPLOAD
const storage = multer.memoryStorage();
const upload = multer({ storage });

// JOBS ROUTES
router
  .route("/")
  .get(jobController.getAllJobs)
  .post(
    authController.protect,
    upload.array("images", 10),
    jobController.createJob
  );

// FOR IMAGE UPLOAD OR DELETE
router.patch(
  "/:id/images",
  authController.protect,
  upload.array("images", 10),
  jobController.updateJobImages
);

router
  .route("/:id")
  .get(jobController.getJob)
  .patch(authController.protect, jobController.updateJobFields)
  .delete(authController.protect, jobController.deleteJob);

module.exports = router;
