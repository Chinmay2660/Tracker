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

export interface StageHistory {
  columnId: string;
  columnTitle?: string;
  enteredDate: string;
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
  // Asked Compensation
  ctcMin?: number;
  ctcMax?: number;
  compensationFixed?: number;
  compensationVariables?: number;
  compensationRSU?: number;
  // Offered Compensation
  offeredCtc?: number;
  offeredCompensationFixed?: number;
  offeredCompensationVariables?: number;
  offeredCompensationRSU?: number;
  resumeVersion?: string;
  notesMarkdown?: string;
  appliedDate?: string;
  lastWorkingDay?: string;
  order?: number;
  stageHistory?: StageHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface InterviewRound {
  _id: string;
  jobId: string;
  stage: string;
  date: string;
  time?: string;
  endTime?: string;
  notesMarkdown?: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface ResumeVersion {
  _id: string;
  userId: string;
  name: string;
  fileUrl: string;
  createdAt: string;
  updatedAt: string;
}

