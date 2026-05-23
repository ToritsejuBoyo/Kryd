-- Enable RLS for all tables
alter table profiles enable row level security;
alter table courses enable row level security;
alter table user_courses enable row level security;
alter table jobs enable row level security;
alter table job_applications enable row level security;
alter table community_posts enable row level security;
alter table point_transactions enable row level security;
alter table notifications enable row level security;

-- profiles: Read own row
create policy "Users can read own profile"
on profiles for select
using (auth.uid() = user_id);

-- profiles: Update own row
create policy "Users can update own profile"
on profiles for update
using (auth.uid() = user_id);

-- profiles: Insert own row (needed for sign up)
create policy "Users can insert own profile"
on profiles for insert
with check (auth.uid() = user_id);

-- courses: Read all authenticated
create policy "Authenticated users can read courses"
on courses for select
to authenticated
using (true);

-- courses: Write nobody from app
-- (No insert/update/delete policies for courses)

-- user_courses: Read own rows
create policy "Users can read own user_courses"
on user_courses for select
using (auth.uid() = user_id);

-- user_courses: Update own rows
create policy "Users can update own user_courses"
on user_courses for update
using (auth.uid() = user_id);

-- user_courses: Insert own rows
create policy "Users can insert own user_courses"
on user_courses for insert
with check (auth.uid() = user_id);

-- user_courses: Delete own rows
create policy "Users can delete own user_courses"
on user_courses for delete
using (auth.uid() = user_id);

-- jobs: Read all authenticated
create policy "Authenticated users can read jobs"
on jobs for select
to authenticated
using (true);

-- jobs: Insert authenticated users
create policy "Authenticated users can insert jobs"
on jobs for insert
to authenticated
with check (auth.uid() = posted_by);

-- job_applications: Read own rows
create policy "Users can read own job_applications"
on job_applications for select
using (auth.uid() = user_id);

-- job_applications: Update own rows
create policy "Users can update own job_applications"
on job_applications for update
using (auth.uid() = user_id);

-- job_applications: Insert own rows
create policy "Users can insert own job_applications"
on job_applications for insert
with check (auth.uid() = user_id);

-- job_applications: Delete own rows
create policy "Users can delete own job_applications"
on job_applications for delete
using (auth.uid() = user_id);

-- community_posts: Read all authenticated
create policy "Authenticated users can read community_posts"
on community_posts for select
to authenticated
using (true);

-- community_posts: Insert own rows
create policy "Users can insert own community_posts"
on community_posts for insert
with check (auth.uid() = user_id);

-- community_posts: Update own rows
create policy "Users can update own community_posts"
on community_posts for update
using (auth.uid() = user_id);

-- community_posts: Delete own rows
create policy "Users can delete own community_posts"
on community_posts for delete
using (auth.uid() = user_id);

-- point_transactions: Read own rows
create policy "Users can read own point_transactions"
on point_transactions for select
using (auth.uid() = user_id);

-- point_transactions: Update own rows
create policy "Users can update own point_transactions"
on point_transactions for update
using (auth.uid() = user_id);

-- point_transactions: Insert own rows
create policy "Users can insert own point_transactions"
on point_transactions for insert
with check (auth.uid() = user_id);

-- point_transactions: Delete own rows
create policy "Users can delete own point_transactions"
on point_transactions for delete
using (auth.uid() = user_id);

-- notifications: Read own rows
create policy "Users can read own notifications"
on notifications for select
using (auth.uid() = user_id);

-- notifications: Update own rows
create policy "Users can update own notifications"
on notifications for update
using (auth.uid() = user_id);

-- notifications: Insert own rows
create policy "Users can insert own notifications"
on notifications for insert
with check (auth.uid() = user_id);

-- notifications: Delete own rows
create policy "Users can delete own notifications"
on notifications for delete
using (auth.uid() = user_id);
