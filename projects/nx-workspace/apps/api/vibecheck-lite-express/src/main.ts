import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { PORT, HOST, CORS_OPTIONS } from './app.const';
import { logger } from '@prettydamntired/test-node-tools';
import { Controller } from './controller';

const app = express();
app.use(cors(CORS_OPTIONS));

app.get('/', (_, response) => {
  response.send('vibecheck-lite-express');
});

app.get('/get-outfit-recommendation', Controller.getOutfitRecommendation);
app.post('/subscribe', express.json(), Controller.subscribe);
app.delete('/unsubscribe/:email', express.json(), Controller.unsubscribe);

export const server = app.listen(PORT as number, HOST, () => {
  logger.info(`Server listening at ${HOST}:${PORT}`);
});

const MONGO_DB_SERVER = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.txzecw2.mongodb.net`;
mongoose.connect(MONGO_DB_SERVER, { dbName: 'vibecheck-lite-db' });
export const db = mongoose.connection;
db.getClient;
db.on('error', error => {
  console.error(`MongoDB connection error: ${error}`);
});
db.once('open', () => {
  logger.info('Connected to MongoDB');
});

export default app;
