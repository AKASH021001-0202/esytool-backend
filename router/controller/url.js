import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { ImageToUrlModel } from "../../db.utils/model.js"; // Import ImageToUrlModel

const ImagetoUrlRouter = express.Router();

// Set upload directory
const uploadDir = path.resolve("uploads/brand");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `${timestamp}-${file.originalname}`;

    cb(null, filename);
  },
});

const upload = multer({ storage });

// 📂 Upload Image and Store URL in MongoDB
ImagetoUrlRouter.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Generate Image URL
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/brand/${req.file.filename}`;

    // Save to MongoDB
    const newImage = new ImageToUrlModel({ filename: req.file.filename, imageUrl });
    await newImage.save();

    res.status(201).json({ message: "Upload successful", imageUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




// 📸 GET All Uploaded Images
ImagetoUrlRouter.get("/images", async (req, res) => {
  try {
    const images = await ImageToUrlModel.find();
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch images" });
  }
});

export default ImagetoUrlRouter;
