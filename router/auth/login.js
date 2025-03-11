import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Usermodel } from "../../db.utils/model.js";

dotenv.config();

const LoginRouter = express.Router();

LoginRouter.post("/", async (req, res) => {
  const { email, password } = req.body;
  console.log("Login Request:", req.body);

  try {
    const user = await Usermodel.findOne({ email });
    console.log("User Record:", user);

    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Compare the hashed password with the entered password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    console.log("Generated Token:", token);

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Middleware to set Cache-Control header
LoginRouter.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

export default LoginRouter;
