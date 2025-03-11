import express from "express";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import { Usermodel } from "../../db.utils/model.js";

dotenv.config();

const RegisterRouter = express.Router();

RegisterRouter.post("/", async (req, res) => {
  const { email, password, phone, name } = req.body;

  try {
    if (!email || !password || !phone || !name) {
      return res.status(400).json({ msg: "Name, email, password, and phone are required" });
    }

    const existingUser = await Usermodel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already registered" });
    }

    // Hash the password before storing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new Usermodel({
      name,
      email,
      phone,
      password: hashedPassword,
      isActive: true, // Directly activating the account since there's no verification
    });

    await user.save();

    res.status(201).json({ msg: "User registered successfully." });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default RegisterRouter;
