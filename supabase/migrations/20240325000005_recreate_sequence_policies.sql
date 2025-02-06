-- Enable RLS
ALTER TABLE sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Recreate sequence policies
CREATE POLICY "Allow reading public sequences"
  ON sequences FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can update own sequences"
  ON sequences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sequences"
  ON sequences FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert sequences"
  ON sequences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin policies for sequences
CREATE POLICY "Admin users can see all sequences"
  ON sequences FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'service_role'
  );

CREATE POLICY "Admin users can insert sequences"
  ON sequences FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'role' = 'service_role'
  );

CREATE POLICY "Admin users can update sequences"
  ON sequences FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'service_role'
  );

CREATE POLICY "Admin users can delete sequences"
  ON sequences FOR DELETE
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Profile policies
CREATE POLICY "Allow reading profiles for public sequences"
  ON profiles FOR SELECT
  USING (
    id IN (
      SELECT user_id 
      FROM sequences 
      WHERE is_public = true
    ) OR
    id = auth.uid()
  );

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id); 