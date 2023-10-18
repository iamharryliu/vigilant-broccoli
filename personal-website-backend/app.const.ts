import mongoose from 'mongoose';

export const HOST = process.env.HOST || '127.0.0.1';
export const PORT = process.env.PORT || 3000;
export const CORS_OPTIONS = { origin: true, credentials: true };

const emailAlertSchema = new mongoose.Schema({
  email: String,
});
export const EmailSubscription = mongoose.model(
  'EmailSubscription',
  emailAlertSchema,
);
