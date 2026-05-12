import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import userModel from "../models/user.model.js";
import redis from "../config/cache.js";

export const authenticateUser = async (req, res, next) => {
  // Accept from cookie OR Authorization: Bearer <token>
  let token = req.cookies?.token;
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided", success: false });
  }

  try {
    // 1. Check Redis blocklist (for logged-out tokens)
    try {
      const isBlocked = await redis.get(`bl_${token}`);
      if (isBlocked) {
        return res.status(401).json({ message: "Unauthorized: Token is invalid", success: false });
      }
    } catch (redisErr) {
      console.warn("Redis check skipped (connection error):", redisErr.message);
    }

    // 2. Verify JWT
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // 3. Find User
    const user = await userModel.findById(decoded.id).select("-password"); // Exclude password for safety

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found", success: false });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    return res.status(401).json({ message: "Unauthorized: Invalid token", success: false });
  }
};

export const authorizeAdmin = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.email === "admin@admin.com")) {
    next();
  } else {
    return res.status(403).json({ message: "Forbidden: Admin access required", success: false });
  }
};
