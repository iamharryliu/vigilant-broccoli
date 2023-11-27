import express from 'express';
import { HTTP_STATUS_CODES } from '../configs/app.const';
import { logger } from '../middlewares/loggers';
import { requireJsonContent } from '../middlewares/common.middleware';
import { VibecheckLiteService } from '../services/vibecheck-lite.service';

export const router = express.Router();
router.use(express.json({ limit: 5000 }));

router.get('/get-outfit-recommendation', async (req, res) => {
  const latitude = Number(req.query.lat);
  const longitude = Number(req.query.lon);
  const recommendation = await VibecheckLiteService.getOutfitRecommendation({
    latitude,
    longitude,
  });
  return res
    .status(HTTP_STATUS_CODES.OK)
    .json({ success: true, data: recommendation });
});

router.post('/vibecheck/subscribe', requireJsonContent, (req, res) => {
  try {
    const email = req.body.email;
    if (!email) {
      return res
        .status(HTTP_STATUS_CODES.BAD_REQUEST)
        .json({ error: 'Email is required.' });
    }
    VibecheckLiteService.subscribeEmail(req.body).then(message => {
      return res.status(HTTP_STATUS_CODES.CREATED).json({
        success: true,
        message: message,
      });
    });
  } catch (error) {
    logger.error(error);
    return res
      .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal server error' });
  }
});

router.put('/vibecheck-lite/unsubscribe/:email', async (req, res) => {
  const email = req.params.email;
  try {
    await VibecheckLiteService.unsubscribeEmail(email);
    return res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      message: 'Successfully unsubscribed',
    });
  } catch (error) {
    logger.error(error);
    return res
      .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal server error' });
  }
});
