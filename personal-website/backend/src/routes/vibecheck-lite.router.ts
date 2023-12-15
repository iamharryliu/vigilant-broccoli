import express from 'express';
import { requireJsonContent } from '../middlewares/common.middleware';
import { VibecheckLiteService } from '../services/vibecheck-lite.service';
import { HTTP_STATUS_CODES } from '@prettydamntired/node-tools';

export const router = express.Router();
router.use(express.json({ limit: 5000 }));

router.get('/get-outfit-recommendation', async (req, res) => {
  const latitude = Number(req.query.lat);
  const longitude = Number(req.query.lon);
  const recommendation = await VibecheckLiteService.getOutfitRecommendation({
    latitude,
    longitude,
  });
  return res.status(HTTP_STATUS_CODES.OK).json({ data: recommendation });
});

router.post('/subscribe', requireJsonContent, (req, res) => {
  const email = req.body.email;
  if (!email) {
    return res
      .status(HTTP_STATUS_CODES.BAD_REQUEST)
      .json({ error: 'Email is required.' });
  }
  VibecheckLiteService.subscribeEmail(req.body).then(message => {
    return res.status(HTTP_STATUS_CODES.OK).json({
      message: message,
    });
  });
});

router.put('/unsubscribe/:email', async (req, res) => {
  const email = req.params.email;
  await VibecheckLiteService.unsubscribeEmail(email);
  return res.status(HTTP_STATUS_CODES.OK).json({
    message: 'Successfully unsubscribed',
  });
});
