export type Role = 'student' | 'instructor' | 'admin';

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  avatar?: string;
  xp?: number;
  streak?: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  instructorName: string;
  progress?: number;
  tags?: string[];
}

export interface Certificate {
  id: string;
  courseId: string;
  courseTitle: string;
  studentName: string;
  issueDate: string;
}

export interface Activity {
  id: string;
  title: string;
  date: string;
  type: 'quiz' | 'lesson' | 'certificate';
  score?: number;
}
