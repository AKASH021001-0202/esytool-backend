import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Usermodel } from "../../db.utils/model.js";

dotenv.config();
const LoginRouter = express.Router();

LoginRouter.post("/", async (req, res) => {
  const { email, password } = req.body;
  console.log("Login Request Received:", req.body);
  
 
  try {
    const user = await Usermodel.findOne({ email: email.toLowerCase() }).select("+password");
    console.log("User Found:", user);
  console.log("Provided Password:", password);

    if (!user) {
      console.log("Invalid User");
      return res.status(400).json({ message: "Invalid User" });
    }

    // Compare passwords
    const trimmedPassword = password.trim();
    const isMatch = await bcrypt.compare(trimmedPassword, user.password);
    console.log("Stored Hashed Password:", user.password);
    console.log("Password Match:", isMatch);

    if (!isMatch) {
      console.log("Invalid Credentials");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    console.log("Generated Token:", token);

    return res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});


export default LoginRouter;
