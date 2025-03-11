import express from 'express';
import crypto from 'crypto';
import { Usermodel } from '../../db.utils/model.js';

const ForgetPassword = express.Router();

ForgetPassword.post('/', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await Usermodel.findOne({ email });

    if (user) {
      // Generate a password reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetToken = resetToken;
      user.resetTokenExpire = Date.now() + 3600000; // 1 hour expiry
      await user.save();

      // TODO: Send email with reset link (implement email service)
      console.log(`Password reset link: http://yourfrontend.com/reset-password?token=${resetToken}`);
    }

    // Always return a generic message for security
    return res.json({ message: 'If this email is registered, you will receive a reset link.' });

  } catch (error) {
    console.error('Error in forget password:', error);
    return res.status(500).json({ message: 'Error processing request' });
  }
});

export default ForgetPassword;
