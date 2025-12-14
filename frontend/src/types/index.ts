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
  color?: string;
  createdAt: string;
}

export interface StageHistory {
  columnId: string;
  columnTitle?: string;
  enteredDate: string;
}

export type InterviewStageStatus = 
  | 'Pending'
  | 'Scheduled'
  | 'Cleared'
  | 'Rejected'
  | 'Shortlisted'
  | 'Pending Results'
  | 'Abandoned by HR'
  | 'Back Off'
  | 'Budget Issue'
  | 'Notice Period Issue'
  | 'No Offer'
  | 'Position Closed'
  | 'Position On Hold'
  | 'Offer Received'
  | 'Offer Accepted'
  | 'Offer Declined';

export interface InterviewStage {
  stageId: string;
  stageName?: string;
  status: InterviewStageStatus;
  date?: string;
  order: number;
}

export interface HRContact {
  name?: string;
  phone?: string;
  email?: string;
}

export interface Job {
  _id: string;
  userId: string;
  columnId: string;
  interviewStages?: InterviewStage[]; // Detailed interview stages with status and date
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
  hrContacts?: HRContact[];
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

