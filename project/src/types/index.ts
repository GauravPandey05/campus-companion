export interface User {
  id: string; // Changed from optional to required
  uid?: string; // Add this line
  name: string;
  email: string;
  role: 'student' | 'cr' | 'admin';
  department: string;
  subclass?: string;
  avatar?: string;
  createdAt: Date;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  subclasses?: string[]; // Added
  createdAt: Date;
}

export interface Subclass {
  id: string;
  name: string;
  department: string;
  year: number;
  semester: number;
  capacity?: number; // Added
  crId?: string;
  createdAt: Date;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  department: string; // Changed from departmentId
  year: number;
  semester: number;
  isShared: boolean;
  sharedWith?: string[]; // Added
  credits: number;
  createdAt: Date;
  description?: string;
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
  fileSize: number; // Note: Stored as string in Firebase, convert when reading
  uploadedBy: string;
  uploaderName: string;
  subclassId: string;
  isShared: boolean;
  tags: string[];
  downloads: number;
  approved: boolean;
  createdAt: Date;
  
  // Google Drive support
  driveFileId?: string;
  viewUrl?: string;
  downloadUrl?: string;
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
  createdAt?: Date; // Added to be consistent with other types
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