import express from "express";
import crypto from "crypto";
import { Usermodel } from "../../db.utils/model.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const ForgotPasswordRouter = express.Router();

ForgotPasswordRouter.post("/", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await Usermodel.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; 

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();
    console.log(user);

    // Send email with the reset link
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.GMAIL_PASS, 
      },
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
console.log(resetLink)
    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset. Click the link below:</p>
             <a href="${resetLink}">${resetLink}</a>
             <p>This link will expire in 1 hour.</p>`,
    }, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ msg: "Failed to send email" });
      }
      console.log("Email sent: " + info.response);
      res.status(200).json({ msg: "Password reset email sent." });
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

export default ForgotPasswordRouter;
