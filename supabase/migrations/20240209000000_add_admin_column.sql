-- Remove previous admin-based policy if it exists
DROP POLICY IF EXISTS "Admins can manage poses" ON poses;

-- Create policy to allow specific users to manage poses
CREATE POLICY "Authorized users can manage poses"
ON poses
FOR ALL
USING (
  auth.email() IN ('katrinasorrentino@gmail.com', 'm.dahmann@gmail.com')
);

-- Create policy to allow all users to view poses
CREATE POLICY "All users can view poses"
ON poses
FOR SELECT
USING (true); 