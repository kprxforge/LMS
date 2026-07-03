-- ============================================================
-- MASTER LMS — SUPABASE POSTGRESQL SCHEMA
-- Run this entire file in Supabase Dashboard > SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT 'u' || substr(md5(random()::text), 1, 9),
    role TEXT NOT NULL CHECK (role IN ('student', 'admin', 'instructor')) DEFAULT 'student',
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    avatar TEXT,
    xp INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    theme TEXT DEFAULT 'light',
    notifications BOOLEAN DEFAULT true,
    mobile TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: courses
-- ============================================================
CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY DEFAULT 'c' || substr(md5(random()::text), 1, 9),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    thumbnail TEXT,
    duration TEXT,
    level TEXT CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
    instructor_name TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: enrollments
-- ============================================================
CREATE TABLE IF NOT EXISTS enrollments (
    id TEXT PRIMARY KEY DEFAULT 'e' || substr(md5(random()::text), 1, 9),
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (student_id, course_id)
);

-- ============================================================
-- TABLE: registration_requests
-- ============================================================
CREATE TABLE IF NOT EXISTS registration_requests (
    id TEXT PRIMARY KEY DEFAULT 'reg' || substr(md5(random()::text), 1, 9),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    mobile TEXT,
    college TEXT,
    interested_course TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    date TIMESTAMPTZ DEFAULT NOW(),
    approval_date TIMESTAMPTZ,
    approved_by TEXT,
    rejected_date TIMESTAMPTZ,
    rejected_by TEXT,
    reason TEXT,
    comment TEXT
);

-- ============================================================
-- TABLE: course_applications
-- ============================================================
CREATE TABLE IF NOT EXISTS course_applications (
    id TEXT PRIMARY KEY DEFAULT 'ca' || substr(md5(random()::text), 1, 9),
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    name TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    date TIMESTAMPTZ DEFAULT NOW(),
    approval_date TIMESTAMPTZ,
    approved_by TEXT,
    rejected_date TIMESTAMPTZ,
    rejected_by TEXT
);

-- ============================================================
-- TABLE: materials
-- ============================================================
CREATE TABLE IF NOT EXISTS materials (
    id TEXT PRIMARY KEY DEFAULT 'm' || substr(md5(random()::text), 1, 9),
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('pdf', 'video', 'doc', 'link')),
    url TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: quizzes
-- ============================================================
CREATE TABLE IF NOT EXISTS quizzes (
    id TEXT PRIMARY KEY DEFAULT 'q' || substr(md5(random()::text), 1, 9),
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    questions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: quiz_attempts
-- ============================================================
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id TEXT PRIMARY KEY DEFAULT 'qa' || substr(md5(random()::text), 1, 9),
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    score NUMERIC(5,2),
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: certificates
-- ============================================================
CREATE TABLE IF NOT EXISTS certificates (
    id TEXT PRIMARY KEY DEFAULT 'cert' || substr(md5(random()::text), 1, 9),
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    course_title TEXT NOT NULL,
    student_name TEXT NOT NULL,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    issue_date TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: activities
-- ============================================================
CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY DEFAULT 'act' || substr(md5(random()::text), 1, 9),
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date TEXT DEFAULT 'Just now',
    type TEXT CHECK (type IN ('quiz', 'lesson', 'certificate', 'system')),
    score NUMERIC(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY DEFAULT 'n' || substr(md5(random()::text), 1, 9),
    student_id TEXT,
    email_id TEXT,
    title TEXT NOT NULL,
    message TEXT,
    type TEXT DEFAULT 'system',
    date TIMESTAMPTZ DEFAULT NOW(),
    read BOOLEAN DEFAULT false
);

-- ============================================================
-- TABLE: achievements
-- ============================================================
CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY DEFAULT 'badge' || substr(md5(random()::text), 1, 9),
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    unlocked_at TEXT
);

-- ============================================================
-- DISABLE ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE registration_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE materials DISABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE certificates DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE achievements DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Admin user
INSERT INTO users (id, role, name, email, password, avatar, xp, streak, theme, notifications)
VALUES ('a1', 'admin', 'Super Admin', 'admin@auralms.com', 'admin123', 'https://i.pravatar.cc/150?u=admin', 0, 0, 'light', true)
ON CONFLICT (id) DO NOTHING;

-- Student users
INSERT INTO users (id, role, name, email, password, avatar, xp, streak, theme, notifications)
VALUES 
  ('u1', 'student', 'Alex Dev', 'student@example.com', 'password', 'https://i.pravatar.cc/150?u=a042581f4e29026024d', 2450, 12, 'light', true),
  ('u2', 'student', 'Taylor Swift', 'taylor@example.com', 'password', 'https://i.pravatar.cc/150?u=a042581f4e29026024e', 1200, 3, 'dark', true)
ON CONFLICT (id) DO NOTHING;

-- Courses
INSERT INTO courses (id, title, description, category, thumbnail, duration, level, instructor_name, tags)
VALUES
  ('c1', 'Advanced Full-Stack System Design', 'Learn how to architect scalable SaaS platforms.', 'Engineering', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800', '12h 30m', 'Advanced', 'Sarah Jenkins', ARRAY['System Design', 'Architecture']),
  ('c2', 'React & Node.js Masterclass', 'Build robust frontend and backend services.', 'Web Development', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800', '8h 15m', 'Intermediate', 'Michael Chen', ARRAY['React', 'Express']),
  ('c3', 'Python Full Stack', 'Comprehensive guide to full stack python development.', 'Engineering', 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&q=80&w=800', '20h 00m', 'Beginner', 'Alex Turner', ARRAY['Python', 'Django', 'React']),
  ('c4', 'Artificial Intelligence', 'Introductory and advanced AI concepts.', 'Data Science', 'https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&q=80&w=800', '15h 45m', 'Advanced', 'Dr. Elena Rostova', ARRAY['AI', 'Machine Learning', 'Deep Learning']),
  ('c5', 'Data Science', 'Data analysis, visualization, and manipulation.', 'Data Science', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800', '18h 20m', 'Intermediate', 'Marcus Webb', ARRAY['Data', 'Analysis', 'Python']),
  ('c6', 'Cloud Computing', 'Mastering AWS, GCP, and Azure basics.', 'Engineering', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800', '10h 10m', 'Intermediate', 'Samantha Lee', ARRAY['Cloud', 'AWS', 'Deployment'])
ON CONFLICT (id) DO NOTHING;

-- Enrollments
INSERT INTO enrollments (id, student_id, course_id, progress, enrolled_at)
VALUES
  ('e1', 'u1', 'c1', 65, '2023-01-01T00:00:00Z'),
  ('e2', 'u1', 'c2', 100, '2023-02-01T00:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Materials
INSERT INTO materials (id, course_id, title, type, url)
VALUES
  ('m1', 'c1', 'System Architecture Diagram', 'pdf', '#'),
  ('m2', 'c2', 'React Component Lifecycle', 'video', '#')
ON CONFLICT (id) DO NOTHING;

-- Quizzes
INSERT INTO quizzes (id, course_id, title, questions)
VALUES
  ('q1', 'c2', 'React Basics Quiz', '[{"q": "What is JSX?", "options": ["Syntax", "Language"], "correct": 0}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Quiz attempts
INSERT INTO quiz_attempts (id, student_id, quiz_id, score)
VALUES
  ('qa1', 'u1', 'q1', 92)
ON CONFLICT (id) DO NOTHING;

-- Certificates
INSERT INTO certificates (id, course_id, course_title, student_name, student_id, issue_date)
VALUES
  ('cert1', 'c2', 'React & Node.js Masterclass', 'Alex Dev', 'u1', '2023-10-20T00:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Activities
INSERT INTO activities (id, student_id, title, date, type, score)
VALUES
  ('act1', 'u1', 'React Basics Quiz', '2 hours ago', 'quiz', 92),
  ('act2', 'u1', 'Earned Frontend Certificate', 'Last week', 'certificate', NULL)
ON CONFLICT (id) DO NOTHING;

-- Achievements
INSERT INTO achievements (id, title, description, icon, unlocked_at)
VALUES
  ('badge1', 'First Blood', 'Completed your first quiz', 'Target', '2023-10-01'),
  ('badge2', 'Week Warrior', 'Maintained a 7-day streak', 'Flame', '2023-10-08')
ON CONFLICT (id) DO NOTHING;
