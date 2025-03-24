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

    // Remove sensitive data from response
    const {
      password: _,
      emailVerificationToken: __,
      ...userWithoutSensitiveData
    } = newUser.toJSON();

    res.status(201).json({
      message:
        "User created successfully. Please check your email to verify your account.",
      user: userWithoutSensitiveData,
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
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        message: "Please verify your email and phone number before logging in",
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

    // Remove sensitive data from response
    const { password: _, ...userWithoutPassword } = user.toJSON();

    res.json({
      message: "Login successful",
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in" });
  }
};

module.exports = {
  signup,
  login,
  verifyEmail,
  sendPhoneVerification,
  verifyPhone,
};
