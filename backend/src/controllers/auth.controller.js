const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const {
  generateVerificationToken,
  sendEmailVerification,
  sendSMSVerification,
} = require("../utils/verification.service");
const { Op } = require("sequelize");

const signup = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate email verification token
    const emailVerificationToken = generateVerificationToken();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      emailVerificationToken,
      emailVerificationExpires,
    });

    try {
      // Send verification email
      await sendEmailVerification(email, emailVerificationToken);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      res.status(500).json({ message: "Failed to send verification email" });
    }

    // Return only specific user data
    const userData = {
      name: newUser.name,
      id: newUser.id,
      email: newUser.email,
      phone: newUser.phone,
      isActive: newUser.isActive,
      isEmailVerified: newUser.isEmailVerified,
      isPhoneVerified: newUser.isPhoneVerified,
    };

    res.status(201).json({
      message:
        "User created successfully. Please check your email to verify your account.",
      user: userData,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Error creating user" });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          [Op.gt]: Date.now(),
        },
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification token" });
    }

    // Update user verification status
    await user.update({
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
      isActive: user.isPhoneVerified, // Activate user if phone is already verified
    });

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ message: "Error verifying email" });
  }
};

const sendPhoneVerification = async (req, res) => {
  try {
    const { phone } = req.body;
    const userId = req.user.id; // Assuming you have authentication middleware

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate verification code
    const verificationCode = await sendSMSVerification(phone);

    // Store verification code (you might want to hash this in production)
    await user.update({
      phone,
      phoneVerificationToken: verificationCode,
      phoneVerificationExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    res.json({ message: "Verification code sent successfully" });
  } catch (error) {
    console.error("Phone verification error:", error);
    res.status(500).json({ message: "Error sending verification code" });
  }
};

const verifyPhone = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id; // Assuming you have authentication middleware

    if (!code) {
      return res.status(400).json({ message: "Verification code is required" });
    }

    const user = await User.findOne({
      where: {
        id: userId,
        phoneVerificationToken: code,
        phoneVerificationExpires: {
          [Op.gt]: Date.now(),
        },
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification code" });
    }

    // Update user verification status
    await user.update({
      isPhoneVerified: true,
      phoneVerificationToken: null,
      phoneVerificationExpires: null,
      isActive: user.isEmailVerified, // Activate user if email is already verified
    });

    res.json({ message: "Phone number verified successfully" });
  } catch (error) {
    console.error("Phone verification error:", error);
    res.status(500).json({ message: "Error verifying phone number" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Check if user is active
    if (!user.isEmailVerified) {
      return res.status(401).json({
        message: "Please verify your email before logging in",
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Return only specific user data
    const userData = {
      name: user.name,
      id: user.id,
      email: user.email,
      phone: user.phone,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
    };

    res.json({
      message: "Login successful",
      user: userData,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in" });
  }
};

// Update user's name
const updateName = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: "Name is required" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name.trim();
    await user.save();

    res.json({
      message: "Name updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
      },
    });
  } catch (error) {
    console.error("Error updating name:", error);
    res.status(500).json({ message: "Failed to update name" });
  }
};

// Update user's phone number
const updatePhone = async (req, res) => {
  try {
    const { phone } = req.body;
    const userId = req.user.id;

    if (!phone || phone.trim().length === 0) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Reset phone verification status when phone number changes
    user.phone = phone.trim();
    user.isPhoneVerified = false;
    await user.save();

    res.json({
      message: "Phone number updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
      },
    });
  } catch (error) {
    console.error("Error updating phone:", error);
    res.status(500).json({ message: "Failed to update phone number" });
  }
};

// Toggle 2FA status
const toggle2FA = async (req, res) => {
  try {
    const { enabled } = req.body;
    const userId = req.user.id;

    if (typeof enabled !== "boolean") {
      return res
        .status(400)
        .json({ message: "Enabled status must be a boolean" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (enabled && !user.isPhoneVerified) {
      return res
        .status(400)
        .json({ message: "Phone number must be verified to enable 2FA" });
    }

    user.is2FAEnabled = enabled;
    await user.save();

    res.json({
      message: `2FA ${enabled ? "enabled" : "disabled"} successfully`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        is2FAEnabled: user.is2FAEnabled,
      },
    });
  } catch (error) {
    console.error("Error toggling 2FA:", error);
    res.status(500).json({ message: "Failed to toggle 2FA" });
  }
};

module.exports = {
  signup,
  login,
  verifyEmail,
  sendPhoneVerification,
  verifyPhone,
  updateName,
  updatePhone,
  toggle2FA,
};
