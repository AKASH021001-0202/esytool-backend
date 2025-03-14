import express from 'express';
import bcrypt from 'bcryptjs';
import { transport } from '../../mail.util.js';
import { Usermodel } from '../../db.utils/model.js';

const ResetPassword = express.Router();

ResetPassword.post('/', async (req, res) => {
  const { token, password } = req.body; // Use `password` instead of `newPassword`

  console.log('Request Body:', req.body); // Log the request body

  // Validate password
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ message: 'New password is required and must be a string' });
  }

  try {
    // Find user by reset token and ensure it's not expired
    const user = await Usermodel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Check if token is not expired
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Hash the new password
    console.log('New Password:', password); // Log the new password
    user.password = await bcrypt.hash(password, 10);

    // Clear the reset token and expiry
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    // Send password reset confirmation email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Successful',
      text: 'Your password has been successfully reset.',
    };

    await transport.sendMail(mailOptions);

    return res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ message: 'Error resetting password' });
  }
});

export default ResetPassword;