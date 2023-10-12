import mongoose from 'mongoose';

export const PORT = process.env.PORT || 3000;
export const CORS_OPTIONS = { origin: true, credentials: true };

const emailAlertSchema = new mongoose.Schema({
  email: String,
});
export const EmailSubscription = mongoose.model(
  'EmailSubscription',
  emailAlertSchema,
);
