const express = require("express");
const authController = require("../controller/authController");

const router = express.Router();

// AUTHENTICATION ROUTES
router.post("/send-otp", authController.sendOTP);
router.post("/verify-email", authController.verifyEmail);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgetPassword);
router.patch("/reset-password", authController.resetPassword);
router.get("/verify-otp", authController.verifyOTP);
router.get("/logout", authController.logout);
router.patch(
  "/update-password",
  authController.protect,
  authController.updatePassword
);

module.exports = router;
