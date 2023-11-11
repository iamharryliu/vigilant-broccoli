import mongoose from 'mongoose';

const emailAlertSchema = new mongoose.Schema({
  email: String,
  isVerified: Boolean,
});
export const EmailSubscription = mongoose.model(
  'EmailSubscription',
  emailAlertSchema,
);
