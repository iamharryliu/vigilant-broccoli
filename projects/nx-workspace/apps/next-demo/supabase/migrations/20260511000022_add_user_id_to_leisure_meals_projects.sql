ALTER TABLE leisure_activities ADD COLUMN user_id uuid REFERENCES auth.users(id);
ALTER TABLE meals ADD COLUMN user_id uuid REFERENCES auth.users(id);
ALTER TABLE home_projects ADD COLUMN user_id uuid REFERENCES auth.users(id);
