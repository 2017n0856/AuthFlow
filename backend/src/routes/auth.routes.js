const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  verifyEmail,
  sendPhoneVerification,
  verifyPhone,
  updateName,
  updatePhone,
  toggle2FA,
  verify2FA,
} = require("../controllers/auth.controller");
const auth = require("../middleware/auth");

// Auth routes
router.post("/signup", signup);
router.post("/login", login);
router.get("/verify-email", verifyEmail);
router.post("/send-phone-verification", auth, sendPhoneVerification);
router.post("/verify-phone", auth, verifyPhone);
router.post("/verify-2fa", verify2FA);
// New routes for profile management
router.put("/profile/name", auth, updateName);
router.put("/profile/phone", auth, updatePhone);
router.post("/profile/2fa/toggle", auth, toggle2FA);

module.exports = router;
