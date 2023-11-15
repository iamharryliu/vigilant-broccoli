import mongoose from 'mongoose';

const emailSubscriptionSchema = new mongoose.Schema({
  email: String,
  isVerified: Boolean,
});
export const EmailSubscription = mongoose.model(
  'EmailSubscription',
  emailSubscriptionSchema,
);
