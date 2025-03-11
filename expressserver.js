import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongooseDb from "./db.utils/mongoose-connection.js";
import RegisterRouter from "./router/auth/register.js";
import LoginRouter from "./router/auth/login.js";
import ForgetPassword from "./router/controller/forgetpassword.js";
import ResetPassword from "./router/controller/resetpassword.js";
import UserRouter from "./router/user.js";
import ActivateRouter from "./router/auth/activater.js";
import UrlRouter from "./router/controller/urlcontroller.js";
import jwt from 'jsonwebtoken';
import { Usermodel } from "./db.utils/model.js";
import QrRouter from "./router/controller/qr.js";
import ImagetoUrlRouter from "./router/controller/url.js";
import path from "path";
// Load environment variables from .env file
dotenv.config();

const server = express();

// Connect to MongoDB using mongoose
await mongooseDb();

// Middleware
server.use(express.json());
server.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: 'GET,POST',
  credentials: true,
}));server.use("/uploads", express.static(path.resolve("uploads")));

// Custom middleware to log requests
const customMiddleware = (req, res, next) => {
  console.log(
    new Date().toISOString(),
    "Handling Request",
    req.method,
    req.originalUrl
  );
  next();
};

// Auth Middleware for routes that need protection
const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Usermodel.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found, authorization denied' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// Apply middleware globally
server.use(customMiddleware);

// Routes that require authentication
server.use("/url", authMiddleware, UrlRouter);

// Routes that don't require authentication
server.use("/registers", RegisterRouter);
server.use("/login", LoginRouter);
server.use("/user", UserRouter);
server.use("/activate", ActivateRouter);
server.use("/forget-password", ForgetPassword);
server.use("/reset-password", ResetPassword);
server.use("/qr", QrRouter);
server.use("/upload", ImagetoUrlRouter);

// Start server
const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log("Server is running on port", port);
});
