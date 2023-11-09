import crypto from 'crypto';
import mongoose from 'mongoose';

export const HOST = process.env.HOST || '127.0.0.1';
export const PORT = process.env.PORT || 3000;
export const CORS_OPTIONS = { origin: true, credentials: true };

const emailAlertSchema = new mongoose.Schema({
  email: String,
  isVerified: Boolean,
});
export const EmailSubscription = mongoose.model(
  'EmailSubscription',
  emailAlertSchema,
);

export const ENCRYPTION_SECRET_KEY = crypto
  .createHash('sha512')
  .update(process.env.SECRET_KEY)
  .digest('hex')
  .substring(0, 32);
export const ENCRYPTION_SECRET_IV = crypto
  .createHash('sha512')
  .update(process.env.SECRET_IV)
  .digest('hex')
  .substring(0, 16);
