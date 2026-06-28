ALTER TABLE resources ADD COLUMN user_id uuid REFERENCES auth.users(id);
ALTER TABLE calendar_events ADD COLUMN user_id uuid REFERENCES auth.users(id);
