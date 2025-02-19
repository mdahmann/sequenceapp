-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Update poses policies to use email directly instead of roles
DROP POLICY IF EXISTS "Authorized users can manage poses" ON poses;
CREATE POLICY "Authorized users can manage poses"
ON poses
FOR ALL
USING (
  auth.email() IN ('katrinasorrentino@gmail.com', 'm.dahmann@gmail.com')
);

-- Ensure the all users view policy exists
DROP POLICY IF EXISTS "All users can view poses" ON poses;
CREATE POLICY "All users can view poses"
ON poses
FOR SELECT
USING (true); 