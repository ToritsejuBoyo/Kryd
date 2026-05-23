-- profiles
create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null unique,
  full_name text,
  role text,  -- 'IT Support Specialist' | 'Student' | 'Employer'
  avatar_url text,
  bio text,
  points int default 0,
  coins int default 0,
  is_pro boolean default false,
  created_at timestamptz default now(),
  default_mode text DEFAULT 'freelancer',
  company_name text,
  work_types text[],
  experience_years text,
  looking_for text,
  hiring_as text,
  it_needs text[],
  budget_range text,
  availability text DEFAULT 'available',
  certifications jsonb DEFAULT '[]',
  hourly_rate numeric,
  profile_complete int DEFAULT 25,
  community_groups text[] DEFAULT ARRAY['Hiring & Projects'],
  country text
);

-- courses
create table courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,  -- 'IT Support' | 'Cloud' | 'Security' | 'Fundamentals'
  level text,     -- 'Beginner' | 'Intermediate' | 'Advanced'
  duration_hrs numeric,
  is_free boolean default true,
  skills text[],
  created_at timestamptz default now()
);

-- user_courses
create table user_courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  course_id uuid references courses not null,
  progress_percent int default 0,
  completed_at timestamptz,
  updated_at timestamptz default now(),
  unique(user_id, course_id)
);

-- jobs
create table jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text,
  location text,
  type text,  -- 'Remote' | 'Freelance' | 'Full-time' | 'Hybrid'
  salary_min numeric,
  salary_max numeric,
  description text,
  skills_required text[],
  posted_by uuid references auth.users,
  created_at timestamptz default now()
);

-- job_applications
create table job_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  job_id uuid references jobs not null,
  status text default 'pending',  -- 'pending' | 'viewed' | 'rejected'
  applied_at timestamptz default now(),
  unique(user_id, job_id)
);

-- community_posts
create table community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  group_name text,  -- 'IT Support' | 'Cloud' | 'Security' | 'Helpdesk' | 'Career'
  content text not null,
  likes_count int default 0,
  created_at timestamptz default now()
);

-- point_transactions
create table point_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  amount int not null,   -- positive = earn, negative = spend
  reason text,
  created_at timestamptz default now()
);

-- notifications
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  message text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- Function and trigger for updated_at on user_courses
create or replace function update_updated_at_column()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;

create trigger update_user_courses_updated_at
before update on user_courses
for each row
execute function update_updated_at_column();

-- Conversations table
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_one uuid REFERENCES auth.users NOT NULL,
  participant_two uuid REFERENCES auth.users NOT NULL,
  job_id uuid REFERENCES jobs,
  context text DEFAULT 'direct',
  -- context: 'job' | 'direct' | 'connection'
  status text DEFAULT 'active',
  -- status: 'active' | 'blocked' | 'request_pending'
  created_at timestamptz DEFAULT now(),
  last_message_at timestamptz DEFAULT now(),
  UNIQUE(participant_one, participant_two)
);

-- Messages table
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations NOT NULL,
  sender_id uuid REFERENCES auth.users NOT NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  contains_url boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Connection requests table
CREATE TABLE connection_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES auth.users NOT NULL,
  receiver_id uuid REFERENCES auth.users NOT NULL,
  status text DEFAULT 'pending',
  -- status: 'pending' | 'accepted' | 'declined' | 'expired'
  message text,
  created_at timestamptz DEFAULT now(),
  responded_at timestamptz,
  expires_at timestamptz DEFAULT (now() + interval '14 days'),
  UNIQUE(sender_id, receiver_id)
);

-- Connections table (established relationships)
CREATE TABLE connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_one uuid REFERENCES auth.users NOT NULL,
  user_two uuid REFERENCES auth.users NOT NULL,
  connected_at timestamptz DEFAULT now(),
  UNIQUE(user_one, user_two)
);

-- Blocked users table
CREATE TABLE blocked_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid REFERENCES auth.users NOT NULL,
  blocked_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

-- Add connect request count to profiles for rate limiting
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS connect_requests_sent_this_week int DEFAULT 0,
ADD COLUMN IF NOT EXISTS connect_requests_reset_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS message_requests_folder_count int DEFAULT 0;

-- Conversations: users can only see their own conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own conversations"
ON conversations FOR SELECT
USING (auth.uid() = participant_one OR auth.uid() = participant_two);

CREATE POLICY "Users create conversations"
ON conversations FOR INSERT
WITH CHECK (auth.uid() = participant_one OR auth.uid() = participant_two);

-- Messages: users can only see messages in their conversations
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own messages"
ON messages FOR SELECT
USING (
  conversation_id IN (
    SELECT id FROM conversations
    WHERE participant_one = auth.uid()
    OR participant_two = auth.uid()
  )
);

CREATE POLICY "Users send messages"
ON messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Connection requests
ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own requests"
ON connection_requests FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users send requests"
ON connection_requests FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Receivers can update status"
ON connection_requests FOR UPDATE
USING (auth.uid() = receiver_id);

-- Connections
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own connections"
ON connections FOR SELECT
USING (auth.uid() = user_one OR auth.uid() = user_two);

-- Blocked users
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own blocks"
ON blocked_users FOR ALL
USING (auth.uid() = blocker_id);
