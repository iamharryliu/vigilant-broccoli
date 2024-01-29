import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { PORT, HOST, CORS_OPTIONS } from './src/app.const';
import { VibecheckLite } from '@prettydamntired/vibecheck-lite';
import { logger } from '@prettydamntired/test-node-tools';
import {
  HTTP_STATUS_CODES,
  EmailSubscription,
} from '@prettydamntired/test-lib';

const app = express();
app.use(cors(CORS_OPTIONS));

app.get('/', (_, response) => {
  response.send('vibecheck-lite-express');
});

app.get('/get-outfit-recommendation', async (req, res) => {
  const latitude = Number(req.query.lat);
  const longitude = Number(req.query.lon);
  const vibecheckLite = new VibecheckLite();
  const recommendation = await vibecheckLite.getOutfitRecommendation({
    latitude,
    longitude,
  });
  return res.status(HTTP_STATUS_CODES.OK).json({ data: recommendation });
});

app.post('/subscribe', express.json(), async (req, res) => {
  const { email, latitude, longitude } = req.body;
  if (!email) {
    return res
      .status(HTTP_STATUS_CODES.BAD_REQUEST)
      .json({ error: 'Email is required.' });
  }
  const emailSubscription = await EmailSubscription.findOne({
    email: email,
  });
  const isSubscribed = !!emailSubscription;
  if (!isSubscribed) {
    const newEmailAlert = new EmailSubscription({
      email,
      latitude,
      longitude,
    });
    await newEmailAlert.save();
  } else {
    await EmailSubscription.findOneAndUpdate(
      {
        email: email,
      },
      {
        $set: {
          latitude,
          longitude,
        },
      },
      { new: true },
    );
  }
  return res.status(HTTP_STATUS_CODES.OK).json({});
});

app.delete('/unsubscribe/:email', express.json(), async (req, res) => {
  const email = req.params.email;
  await EmailSubscription.findOneAndDelete({ email });
  return res.status(HTTP_STATUS_CODES.OK).json({});
});

export const server = app.listen(PORT as number, HOST, () => {
  logger.info(`Server listening at ${HOST}:${PORT}`);
});

const MONGO_DB_SERVER = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.txzecw2.mongodb.net`;
mongoose.connect(MONGO_DB_SERVER, { dbName: 'vibecheck-lite' });
export const db = mongoose.connection;
db.getClient;
db.on('error', error => {
  console.error(`MongoDB connection error: ${error}`);
});
db.once('open', () => {
  logger.info('Connected to MongoDB');
});

export default app;
