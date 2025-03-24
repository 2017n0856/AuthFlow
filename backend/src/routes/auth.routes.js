const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  verifyEmail,
  sendPhoneVerification,
  verifyPhone,
} = require("../controllers/auth.controller");
const auth = require("../middleware/auth");

// Auth routes
router.post("/signup", signup);
router.post("/login", login);
router.get("/verify-email", verifyEmail);
router.post("/send-phone-verification", auth, sendPhoneVerification);
router.post("/verify-phone", auth, verifyPhone);

module.exports = router;
