import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true
    },
    email: { 
      type: String, 
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ // Ensures valid email format
    },
    phone: { 
      type: String, 
      required: false, // Optional phone field
      match: /^[0-9]{10}$/ // Optional: Enforce 10-digit format
    },
    password: { 
      type: String, 
      required: true
    },
    isActive: { 
      type: Boolean, 
      default: false 
    },
    activationToken: { 
      type: String, 
      required: false,
      index: true // Improves lookup speed
    },
    activationTokenExpires: { 
      type: Date,
      required: false
    },
    resetPasswordToken: { 
      type: String, 
      required: false,
      index: true // Improves lookup speed
    },
    resetPasswordExpires: { 
      type: Date, 
      required: false 
    }
  },
  { timestamps: true }
);



const Usermodel = mongoose.model("User", userSchema, "Users");
// URL Schema
const urlSchema = new mongoose.Schema(
  {
    originalUrl: { 
      type: String, 
      required: true 
    },
    shortUrl: { 
      type: String, 
      required: true 
    },
    clickCount: { 
      type: Number, 
      default: 0 
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    },
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    user_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true 
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

const UrlModel = mongoose.model('URL', urlSchema, 'urls');

const qrSchema = new mongoose.Schema({
  text: { type: String, required: true },
  qrCode: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const QrCodeModel = mongoose.model('QrCode', qrSchema, 'qrcodes');

// Mongoose Model
const ImageTourlSchema = new mongoose.Schema({
  filename: String,
  imageUrl: String,
});
const ImageToUrlModel = mongoose.model("ImageToUrl", ImageTourlSchema ,"imagetourls");

export { Usermodel, UrlModel,QrCodeModel ,ImageToUrlModel};
  