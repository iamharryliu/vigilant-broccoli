import express from 'express';
import { requireJsonContent } from '../middlewares/common.middleware';
import { VibecheckLiteService } from '../services/vibecheck-lite.service';
import { HTTP_STATUS_CODES } from '@prettydamntired/node-tools';

export const router = express.Router();
router.use(express.json({ limit: 5000 }));

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
