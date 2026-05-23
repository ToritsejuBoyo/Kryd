-- Seed data for courses
insert into courses (title, description, category, level, duration_hrs, is_free, skills) values
('CompTIA A+ Core 1 & 2', 'IT Support', 'IT Support', 'Beginner', 18, true, array['Hardware', 'Networking', 'Troubleshooting']),
('Cybersecurity Fundamentals', 'Security', 'Security', 'Beginner', 12, false, array['Security', 'Threats', 'Vulnerabilities']),
('Google Cloud Associate Engineer', 'Cloud', 'Cloud', 'Intermediate', 24, true, array['GCP', 'Cloud Computing', 'Networking']),
('Windows Server Administration', 'IT Support', 'IT Support', 'Intermediate', 10, true, array['Windows Server', 'Active Directory', 'Group Policy']),
('Helpdesk Ticketing & ITSM', 'IT Support', 'IT Support', 'Beginner', 6, true, array['ITSM', 'Ticketing', 'Customer Service']),
('Linux for IT Professionals', 'Fundamentals', 'Fundamentals', 'Beginner', 8, true, array['Linux', 'CLI', 'System Administration']);

-- Seed data for jobs
insert into jobs (title, company, location, type, salary_min, salary_max, description, skills_required) values
('IT Support Specialist L2', 'TechNova Inc', 'Remote', 'Full-time', 4500, 5500, 'We are looking for an IT Support Specialist L2 to join our team.', array['IT Support', 'Troubleshooting', 'Customer Service']),
('Cloud Support Engineer', 'CloudBase Ltd', 'Lagos Hybrid', 'Full-time', 3000, 4000, 'We are looking for a Cloud Support Engineer to join our team.', array['Cloud', 'AWS', 'GCP']),
('Freelance: Network Setup & Config', 'Remote', 'Remote', 'Freelance', 800, 800, 'We are looking for a freelancer to set up and configure our network.', array['Networking', 'Hardware', 'Configuration']),
('Helpdesk Analyst', 'FinCorp', 'Remote', 'Full-time', 2500, 3200, 'We are looking for a Helpdesk Analyst to join our team.', array['Helpdesk', 'Ticketing', 'Customer Service']),
('Junior IT Support', 'GreenTech', 'Remote', 'Full-time', 1800, 2500, 'We are looking for a Junior IT Support to join our team.', array['IT Support', 'Hardware', 'Networking']),
('Freelance: Server Migration Project', 'Remote', 'Remote', 'Freelance', 1500, 1500, 'We are looking for a freelancer to migrate our server.', array['Server', 'Migration', 'Cloud']);

-- Seed data for community posts
insert into community_posts (user_id, group_name, content, likes_count) values
('00000000-0000-0000-0000-000000000001', 'IT Support', 'Just passed my CompTIA A+ exam! What certification should I target next?', 10),
('00000000-0000-0000-0000-000000000001', 'Cloud', 'Anyone struggling with AWS IAM policies? I keep getting AccessDenied errors.', 5),
('00000000-0000-0000-0000-000000000001', 'Security', 'Looking for a Security+ study partner. Planning to sit it in 6 weeks.', 20),
('00000000-0000-0000-0000-000000000001', 'Helpdesk', 'Tip: Always document every ticket resolution in detail. Future you will thank you.', 15),
('00000000-0000-0000-0000-000000000001', 'Career', 'Landed my first IT Support role through Kryd! The AI matching is surprisingly accurate.', 30),
('00000000-0000-0000-0000-000000000001', 'IT Support', 'What''s everyone''s go-to resource for learning Linux CLI?', 8);
