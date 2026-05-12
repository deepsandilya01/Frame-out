import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { config, getFrontendUrl } from "../config/config.js";
import { sendEmail } from "../services/mail.service.js";
import { getVerificationEmail, getPasswordResetEmail } from "../utils/emailTemplates.js";
import redis from "../config/cache.js";
import asyncHandler from "../utils/asyncHandler.js";

const generateToken = (id, expiresIn = "7d") => {
  return jwt.sign({ id }, config.JWT_SECRET, { expiresIn });
};

const sendTokenResponse = async (user, res, message) => {
  const token = generateToken(user._id);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    message,
    success: true,
    token,
    user: {
      id: user._id,
      email: user.email,
      fullname: user.fullname,
      verified: user.verified,
      level: user.level,
      rank: user.rank,
    },
  });
};

// @desc    Register user
// @route   POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { email, contact, password, fullname } = req.body;

  const existingUser = await userModel.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User with this email already exists", success: false });
  }

  const user = await userModel.create({
    email,
    contact,
    password,
    fullname,
    verified: false,
  });

  const verifyToken = jwt.sign({ email: user.email }, config.JWT_SECRET, { expiresIn: "1h" });
  const verifyUrl = `${getFrontendUrl(req)}/verify-email?token=${verifyToken}`;

  try {
    await sendEmail({
      to: email,
      subject: "Verify Your Flow 🚀",
      html: getVerificationEmail(verifyUrl),
    });

    res.status(201).json({
      message: "Registration successful. Please check your email to verify your account.",
      success: true,
    });
  } catch (emailError) {
    console.error("Email failed:", emailError);
    await userModel.findByIdAndDelete(user._id);
    return res.status(500).json({
      message: "Failed to send verification email. User registration rolled back.",
      success: false,
    });
  }
});

// @desc    Verify email
// @route   GET /api/auth/verify-email
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ message: "Token is required", success: false });

  const decoded = jwt.verify(token, config.JWT_SECRET);
  const user = await userModel.findOne({ email: decoded.email });

  if (!user) return res.status(404).json({ message: "User not found", success: false });
  if (user.verified) return res.json({ message: "Already verified", success: true });

  user.verified = true;
  await user.save();

  res.json({ message: "Email verified successfully", success: true });
});

// @desc    Login user
// @route   POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid email or password", success: false });
  }

  if (!user.verified) {
    return res.status(403).json({ message: "Please verify your email first", success: false });
  }

  await sendTokenResponse(user, res, "Login successful");
});

// @desc    Get current user
// @route   GET /api/auth/get-me
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      email: req.user.email,
      fullname: req.user.fullname,
      verified: req.user.verified,
      level: req.user.level,
      rank: req.user.rank,
    },
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email });

  if (!user) return res.status(404).json({ message: "User not found", success: false });

  const resetToken = generateToken(user._id, "1h");
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpire = Date.now() + 3600000;
  await user.save();

  const resetUrl = `${getFrontendUrl(req)}/reset-password?token=${resetToken}`;

  await sendEmail({
    to: email,
    subject: "Reset Your Password 🔐",
    html: getPasswordResetEmail(resetUrl),
  });

  res.json({ message: "Password reset link sent", success: true });
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  const decoded = jwt.verify(token, config.JWT_SECRET);
  const user = await userModel.findOne({
    _id: decoded.id,
    resetPasswordToken: token,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ message: "Invalid or expired token", success: false });

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ message: "Password reset successful", success: true });
});

// @desc    Google auth callback
// @route   GET /api/auth/google/callback
export const googleCallback = asyncHandler(async (req, res) => {
  const { id, displayName, emails } = req.user;
  const email = emails[0].value;

  let user = await userModel.findOne({ email });

  if (!user) {
    user = await userModel.create({
      email,
      googleId: id,
      fullname: displayName,
      verified: true, // Google emails are already verified
    });
  } else if (!user.verified) {
    user.verified = true;
    await user.save();
  }

  const token = generateToken(user._id);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const redirectUrl =
    config.NODE_ENV === "development" ? config.LOCAL_FRONTEND_URL : config.FRONTEND_URL;

  res.redirect(redirectUrl);
});

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email });

  if (!user) return res.status(404).json({ message: "User not found", success: false });
  if (user.verified) return res.status(400).json({ message: "Already verified", success: false });

  const verifyToken = jwt.sign({ email: user.email }, config.JWT_SECRET, { expiresIn: "1h" });
  const verifyUrl = `${getFrontendUrl(req)}/verify-email?token=${verifyToken}`;

  await sendEmail({
    to: email,
    subject: "Verify Your Flow 🚀",
    html: getVerificationEmail(verifyUrl),
  });

  res.json({ message: "Verification email resent", success: true });
});

// @desc    Logout user
// @route   POST /api/auth/logout
export const logoutUser = asyncHandler(async (req, res) => {
  let token = req.cookies?.token;
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      const expireTime = decoded.exp - Math.floor(Date.now() / 1000);
      if (expireTime > 0) {
        await redis.set(`bl_${token}`, "blocked", "EX", expireTime);
      }
    } catch (e) {}
  }

  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully", success: true });
});
