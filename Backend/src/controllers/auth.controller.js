import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import { sendEmail } from "../services/mail.service.js";
import redis from "../config/cache.js";

async function sendTokenResponse(user, res, message) {
  const token = jwt.sign(
    {
      id: user._id,
    },
    config.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

  res.cookie("token", token);

  res.status(200).json({
    message,
    success: true,
    token,
    user: {
      id: user._id,
      email: user.email,
      contact: user.contact,
      fullname: user.fullname,
      verified: user.verified,
    },
  });
}

export const register = async (req, res) => {
  const { email, contact, password, fullname } = req.body;

  try {
    const existingUser = await userModel.findOne({
      $or: [{ email }, { contact: contact || "dummy_contact_never_match" }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email or contact already exists", success: false });
    }

    const user = await userModel.create({
      email,
      contact,
      password,
      fullname,
      verified: false,
    });

    // Email verification token
    const token = jwt.sign({ email: user.email }, config.JWT_SECRET, {
      expiresIn: "1h",
    });

    try {
      await sendEmail({
        to: email,
        subject: "Verify Your Email 🚀",
        html: `
          <h2>Hello ${fullname},</h2>
          <p>Welcome to <strong>Our Platform</strong></p>
          <p>Click below to verify your email:</p>
          <a href="${config.FRONTEND_URL || "http://localhost:5173"}/verify-email?token=${token}">
            Verify Email
          </a>
          <p>This link expires in 1 hour.</p>
        `,
      });
      
      res.status(201).json({
        message: "Registered successfully. Please check your email to verify your account.",
        success: true,
      });
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      await userModel.findByIdAndDelete(user._id);
      return res.status(500).json({
        message: "Failed to send verification email. Please ensure you are using a verified Resend domain.",
        success: false,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Token is required", success: false });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await userModel.findOne({ email: decoded.email });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
        success: false,
      });
    }

    if (user.verified) {
      return res.json({
        message: "Already verified",
        success: true,
      });
    }

    user.verified = true;
    await user.save();

    res.json({ message: "Email verified successfully", success: true });
  } catch (err) {
    return res.status(400).json({
      message: "Invalid or expired token",
      success: false,
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password", success: false });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password", success: false });
    }

    if (!user.verified) {
      return res.status(400).json({
        message: "Please verify your email first",
        success: false,
      });
    }

    await sendTokenResponse(user, res, "User logged in successfully");
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const googleCallback = async (req, res) => {
  const { id, displayName, emails, photos } = req.user;
  const email = emails[0].value;
  const profilePic = photos ? photos[0].value : "";

  let user = await userModel.findOne({
    email,
  });

  if (!user) {
    user = await userModel.create({
      email,
      googleId: id,
      fullname: displayName,
      verified: true,
    });
  } else if (!user.verified) {
    user.verified = true;
    await user.save();
  }

  const token = jwt.sign(
    {
      id: user._id,
    },
    config.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

  res.cookie("token", token);

  res.redirect(config.FRONTEND_URL || "http://localhost:5173");
};

export const getMe = async (req, res) => {
  const user = req.user;

  res.status(200).json({
    message: "User fetched successfully",
    success: true,
    user: {
      id: user._id,
      email: user.email,
      contact: user.contact,
      fullname: user.fullname,
      verified: user.verified,
    },
  });
};

export const resendVerification = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found", success: false });
    }

    if (user.verified) {
      return res.status(400).json({ message: "User is already verified", success: false });
    }

    const token = jwt.sign({ email: user.email }, config.JWT_SECRET, {
      expiresIn: "1h",
    });

    await sendEmail({
      to: email,
      subject: "Verify Your Email 🚀",
      html: `
        <h2>Hello ${user.fullname},</h2>
        <p>You requested to resend your verification email.</p>
        <p>Click below to verify your email:</p>
        <a href="${config.FRONTEND_URL || "http://localhost:5173"}/verify-email?token=${token}">
          Verify Email
        </a>
        <p>This link expires in 1 hour.</p>
      `,
    });

    res.json({ message: "Verification email resent successfully", success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found", success: false });
    }

    if (user.googleId && !user.password) {
      return res.status(400).json({ message: "Cannot reset password for Google-authenticated users", success: false });
    }

    const resetToken = jwt.sign({ id: user._id }, config.JWT_SECRET, {
      expiresIn: "15m",
    });

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save();

    await sendEmail({
      to: email,
      subject: "Password Reset Request 🔐",
      html: `
        <h2>Hello ${user.fullname},</h2>
        <p>You requested a password reset.</p>
        <p>Click below to reset your password:</p>
        <a href="${config.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}">
          Reset Password
        </a>
        <p>This link expires in 15 minutes.</p>
      `,
    });

    res.json({ message: "Password reset email sent", success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required", success: false });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    const user = await userModel.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token", success: false });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: "Password reset successfully", success: true });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Invalid or expired token", success: false });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(400).json({
        message: "No token provided",
        success: false,
      });
    }

    res.clearCookie("token");

    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      const expireTime = decoded.exp - Math.floor(Date.now() / 1000);

      // Add to Redis blocklist if token hasn't expired yet
      if (expireTime > 0) {
        await redis.set(`bl_${token}`, "blocked", "EX", expireTime);
      }
    } catch (err) {
      // Token might already be invalid/expired, just proceed to clear cookie
    }

    res.status(200).json({
      message: "Logout successful",
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};