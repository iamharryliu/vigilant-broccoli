CREATE TABLE IF NOT EXISTS email_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  subscription_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (email, subscription_name)
);

CREATE INDEX IF NOT EXISTS idx_email_subscriptions_subscription_name
  ON email_subscriptions (subscription_name);
