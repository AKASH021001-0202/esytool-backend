import express from 'express';
import { UrlModel } from '../../db.utils/model.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Usermodel } from '../../db.utils/model.js'; // Ensure the correct path

const UrlRouter = express.Router();

// Route to get all URLs for the authenticated user
UrlRouter.get('/user', async (req, res) => {
  const userId = req.user._id;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const urls = await UrlModel.find({ user_id: userId });

    if (urls.length === 0) {
      console.log('No URLs found for user:', userId);
    }

    res.json(urls);
  } catch (err) {
    console.error('Error fetching user URLs:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

UrlRouter.post('/shorten', async (req, res) => {
  const { longUrl } = req.body;
  const userId = req.user._id;

  if (!longUrl) {
    console.log('Long URL is required');
    return res.status(400).json({ msg: 'Long URL is required' });
  }

  try {
    const shortId = crypto.randomBytes(6).toString('hex');
    const newUrl = new UrlModel({
      originalUrl: longUrl,
      shortUrl: shortId,
      user_id: userId,
    });

    await newUrl.save();

    console.log('Short URL created:', `${process.env.FRONTEND_URL}/${shortId}`);
    res.json({ shortUrl: `${process.env.FRONTEND_URL}/${shortId}` });
  } catch (err) {
    console.error('Error shortening URL:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

UrlRouter.get('/:shortId', async (req, res) => {
  const { shortId } = req.params;
  console.log('Received request to redirect short ID:', shortId);

  try {
    const urlMapping = await UrlModel.findOneAndUpdate(
      { shortUrl: shortId },
      { $inc: { clickCount: 1 } },
      { new: true }
    );

    if (!urlMapping) {
      console.log('URL not found for short ID:', shortId);
      return res.status(404).json({ msg: 'URL not found' });
    }

    console.log('Redirecting to original URL:', urlMapping.originalUrl);
    res.json({ originalUrl: urlMapping.originalUrl });
  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Route to get URL statistics
UrlRouter.get('/all/stats', async (req, res) => {
  console.log('Received request for /stats'); // Log request
  try {
    const dailyCount = await UrlModel.countDocuments({
      createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 1)) },
    });

    const monthlyCount = await UrlModel.countDocuments({
      createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) },
    });

    res.json({ daily: dailyCount, monthly: monthlyCount });
  } catch (err) {
    console.error('Error fetching URL statistics:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});


export default UrlRouter;
