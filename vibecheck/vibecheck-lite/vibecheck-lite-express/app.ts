import express from 'express';
import cors from 'cors';
import { PORT, HOST, CORS_OPTIONS } from './src/configs/app.const';
import { logger } from '@prettydamntired/node-tools';
import { VibecheckLite } from '@prettydamntired/vibecheck-lite';
import { HTTP_STATUS_CODES } from '@prettydamntired/node-tools';

const app = express();
app.use(cors(CORS_OPTIONS));

app.get('/', (_, response) => {
  response.send('Response for GET endpoint request');
});

app.get('/get-outfit-recommendation', async (req, res) => {
  const latitude = Number(req.query.lat);
  const longitude = Number(req.query.lon);
  const recommendation = await VibecheckLite.getOutfitRecommendation({
    latitude,
    longitude,
  });
  return res.status(HTTP_STATUS_CODES.OK).json({ data: recommendation });
});

export const server = app.listen(PORT as number, HOST, () => {
  logger.info(`Server listening at ${HOST}:${PORT}`);
});

export default app;
