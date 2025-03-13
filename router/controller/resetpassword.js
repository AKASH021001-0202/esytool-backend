import express from "express";
import { Usermodel } from "../../db.utils/model.js";
import bcrypt from "bcryptjs";

const ResetPasswordRouter = express.Router();

ResetPasswordRouter.post("/", async (req, res) => {
  const { password, token } = req.body;

  try {
    // Validate input
    if (!token || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Missing required fields: token and password" 
      });
    }

    // Find user with valid token
    const user = await Usermodel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid or expired reset token" 
      });
    }

    // Check password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters"
      });
    }

    // Hash password with configurable salt rounds
    const saltRounds = process.env.BCRYPT_SALT_ROUNDS || 10;
    user.password = await bcrypt.hash(password, saltRounds);

    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Invalidate all sessions (optional)
    user.refreshToken = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful"
    });

  } catch (error) {
    console.error("Password Reset Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

export default ResetPasswordRouter;
