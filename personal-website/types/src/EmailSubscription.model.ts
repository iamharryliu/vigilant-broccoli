import mongoose from 'mongoose';

const emailSubscriptionSchema = new mongoose.Schema({
  email: String,
  isVerified: Boolean,
  dateCreated: Date,
  vibecheckLiteSubscription: {
    latitude: Number,
    longitude: Number,
  },
});

export const EmailSubscription = mongoose.model(
  'EmailSubscription',
  emailSubscriptionSchema,
);
