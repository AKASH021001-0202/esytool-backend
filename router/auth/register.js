import express from "express";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { Usermodel } from "../../db.utils/model.js";

dotenv.config();

const RegisterRouter = express.Router();

RegisterRouter.post("/", async (req, res) => {
  const { email, password, phone, name } = req.body;

  try {
    // Validate required fields
    if (!email || !password || !phone || !name) {
      return res.status(400).json({ msg: "Name, email, password, and phone are required." });
    }

    // Check if email already exists
    const existingUserByEmail = await Usermodel.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({ msg: "User with this email already exists." });
    }

    // Check if name already exists (if still unique)
    const existingUserByName = await Usermodel.findOne({ name });
    if (existingUserByName) {
      return res.status(400).json({ msg: "Name is already taken. Choose a different name." });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const user = new Usermodel({
      name,
      email,
      phone,
      password: hashedPassword,
      isActive: true, // Directly activating the account
    });

    await user.save();

    return res.status(201).json({ msg: "User registered successfully." });

  } catch (err) {
    console.error("Registration error:", err);

    // Handle duplicate key error (E11000)
    if (err.code === 11000) {
      return res.status(400).json({ msg: "Duplicate entry. Email or Name is already taken." });
    }

    return res.status(500).json({ msg: "Server error. Please try again later." });
  }
});

export default RegisterRouter;
