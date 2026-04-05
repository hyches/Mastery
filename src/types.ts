export type TopicStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Review';

export interface SubTopic {
  id: string;
  name: string;
  status: TopicStatus;
  confidence: number;
  obsidianPath?: string;
  notes?: string;
}

export interface CFATopic {
  id: string;
  name: string;
  weight: string;
  status: TopicStatus;
  confidence: number;
  obsidianPath?: string;
  lastStudied?: string;
  notes?: string;
  subTopics?: SubTopic[];
}

export interface StudySession {
  id: string;
  topicId: string;
  durationMinutes: number;
  date: string;
  startTime?: string;
  endTime?: string;
  startPage?: number;
  endPage?: number;
  sessionProgress?: number;
  notes?: string;
}

export type AssessmentType = 'Mock' | 'Revision' | 'Sectional Test';

export interface ScheduledRevision {
  id: string;
  topicId?: string; // If null, it's for the entire course
  subTopicId?: string;
  date: string;
  time: string;
  status: 'Pending' | 'Completed' | 'Missed';
}

export interface Assessment {
  id: string;
  type: AssessmentType;
  topicId?: string; // Optional: for topic-specific tests
  subTopicId?: string;
  name: string;
  date: string;
  time?: string; // Optional: for scheduled revisions/tests
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  score?: number;
  totalMarks?: number;
  strengthTopics: string[];
  weaknessTopics: string[];
  strengthImpact?: string;
  weaknessImprovement?: string;
  originAssessmentId?: string; // To track lineage (e.g., Revision created from a Mock weakness)
  notes?: string;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  topics: CFATopic[];
  sessions: StudySession[];
  assessments: Assessment[];
  scheduledRevisions: ScheduledRevision[];
  examDate: string;
  vaultName: string;
}

export interface AppState {
  courses: Course[];
  activeCourseId: string | null;
}
