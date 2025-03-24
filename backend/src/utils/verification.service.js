const nodemailer = require("nodemailer");
const twilio = require("twilio");
const crypto = require("crypto");

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Twilio configuration
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Send email verification
const sendEmailVerification = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify Your Email",
    html: `
      <h1>Email Verification</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, please ignore this email.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Send SMS verification
const sendSMSVerification = async (phoneNumber) => {
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  await twilioClient.messages.create({
    body: `Your verification code is: ${verificationCode}`,
    to: phoneNumber,
    from: process.env.TWILIO_PHONE_NUMBER,
  });

  return verificationCode;
};

module.exports = {
  generateVerificationToken,
  sendEmailVerification,
  sendSMSVerification,
};
