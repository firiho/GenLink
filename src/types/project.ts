export interface Project {
  id: string;
  title: string;
  description: string;
  readme: string; // Markdown-like content
  youtubeVideoId?: string; // YouTube video ID for demo
  challengeId: string;
  challengeTitle?: string;
  categories?: string[]; // Categories from the challenge
  userId?: string; // Individual project
  teamId?: string; // Team project
  status: 'draft' | 'in-progress' | 'submitted';
  visibility: 'public' | 'private'; // public: can be showcased, private: only challenge maker + team members
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
}

export interface CreateProjectData {
  title: string;
  description: string;
  readme: string;
  youtubeVideoId?: string;
  challengeId: string;
  teamId?: string; // Optional, if creating as part of team
  visibility: 'public' | 'private'; // public: can be showcased, private: only challenge maker + team members
}

