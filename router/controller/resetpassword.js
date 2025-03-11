import express from 'express';
import bcrypt from 'bcryptjs';
import { Usermodel } from '../../db.utils/model.js';

const ResetPassword = express.Router();

ResetPassword.post('/', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await Usermodel.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() }, 
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null;
    user.resetTokenExpire = null;
    await user.save();

    return res.json({ message: 'Password reset successful' });

  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ message: 'Error resetting password' });
  }
});

export default ResetPassword;
