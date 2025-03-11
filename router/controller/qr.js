import express from "express";
import QRCode from "qrcode";
import { QrCodeModel } from "../../db.utils/model.js";

const QrRouter = express.Router();

// Generate & Store QR Code
QrRouter.post("/generate", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text.trim()) return res.status(400).json({ error: "Text is required" });

    const qrCodeData = await QRCode.toDataURL(text);
    const newQR = new QrCodeModel({ text, qrCode: qrCodeData });
    await newQR.save();

    res.json({ success: true, qrCode: qrCodeData });
  } catch (error) {
    console.error("QR Generation Error:", error);
    res.status(500).json({ error: "Error generating QR code" });
  }
});

// Fetch All QR Codes
QrRouter.get("/qrcodes", async (req, res) => {
  try {
    const qrcodes = await QrCodeModel.find().sort({ createdAt: -1 });
    res.json(qrcodes);
  } catch (error) {
    console.error("Fetch QR Error:", error);
    res.status(500).json({ error: "Error fetching QR codes" });
  }
});

export default QrRouter;
