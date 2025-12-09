export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Column {
  _id: string;
  userId: string;
  title: string;
  order: number;
  createdAt: string;
}

export interface Job {
  _id: string;
  userId: string;
  columnId: string;
  companyName: string;
  role: string;
  jobUrl?: string;
  location: string;
  tags: string[];
  compensationType?: 'fixed' | 'range';
  compensationMin?: number;
  compensationMax?: number;
  resumeVersion?: string;
  notesMarkdown?: string;
  appliedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewRound {
  _id: string;
  jobId: string;
  stage: string;
  date: string;
  time?: string;
  notesMarkdown?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface ResumeVersion {
  _id: string;
  userId: string;
  name: string;
  fileUrl: string;
  uploadedAt: string;
}

