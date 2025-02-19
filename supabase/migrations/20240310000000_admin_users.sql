-- Create a table to store admin users
create table if not exists admin_users (
  id uuid references auth.users on delete cascade,
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

-- Enable RLS
alter table admin_users enable row level security;

-- Create a policy to allow admins to view the admin_users table
create policy "Admins can view admin_users"
  on admin_users for select
  using (auth.uid() in (select id from admin_users));

-- Create a policy to allow admins to manage poses
create policy "Admins can manage poses"
  on poses for all
  using (auth.uid() in (select id from admin_users));

-- Insert initial admin users
insert into admin_users (id, email)
select id, email 
from auth.users 
where email in ('katrinasorrentino@gmail.com', 'm.dahmann@gmail.com')
on conflict (email) do nothing;
 