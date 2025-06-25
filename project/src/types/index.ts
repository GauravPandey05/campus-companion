export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'cr' | 'admin';
  department?: string;
  subclass?: string;
  avatar?: string;
  createdAt: Date;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  createdAt: Date;
}

export interface Subclass {
  id: string;
  name: string;
  department: string;
  year: number;
  semester: number;
  crId?: string;
  createdAt: Date;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  year: number;
  semester: number;
  isShared: boolean;
  credits: number;
  createdAt: Date;
  description?: string; // Optional field for subject description
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subjectCode: string;
  dueDate: Date;
  subclassId: string;
  createdBy: string;
  attachments?: string[];
  status: 'pending' | 'submitted' | 'graded';
  createdAt: Date;
}

export interface Note {
  id: string;
  title: string;
  description: string;
  subjectCode: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  uploadedBy: string;
  uploaderName: string;
  subclassId: string;
  isShared: boolean;
  tags: string[];
  downloads: number;
  approved: boolean; // Make this required instead of optional
  createdAt: Date;
}

export interface TimetableSlot {
  id: string;
  subjectCode: string;
  subjectName: string;
  teacher: string;
  room: string;
  day: string;
  startTime: string;
  endTime: string;
  subclassId: string;
  type: 'lecture' | 'lab' | 'tutorial';
}

export interface DiscussionThread {
  id: string;
  title: string;
  content: string;
  author: string;
  authorName: string;
  subjectCode?: string;
  tags: string[];
  visibility: 'public' | 'department' | 'class';
  upvotes: number;
  downvotes: number;
  commentCount: number;
  isResolved: boolean;
  createdAt: Date;
}

export interface Comment {
  id: string;
  threadId: string;
  content: string;
  author: string;
  authorName: string;
  parentId?: string;
  upvotes: number;
  downvotes: number;
  replies?: Comment[];
  createdAt: Date;
}