export interface PortfolioItem {
  id: string;
  userId: string;
  type: PortfolioSection;
  title: string;
  description?: string;
  date?: string;
  attachments?: PortfolioFile[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioFile {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'document';
  url: string;
  size: number;
  uploadedAt: string;
}

export type PortfolioSection = 
  | 'general' 
  | 'publications' 
  | 'teaching' 
  | 'achievements' 
  | 'additional';

export interface GeneralInfo extends Omit<PortfolioItem, 'type'> {
  type: 'general';
  fullName: string;
  position: string;
  department: string;
  education: string;
  experience: string;
  skills: string[];
  languages: string[];
  contactInfo: {
    email: string;
    phone?: string;
    address?: string;
  };
}

export interface Publication extends Omit<PortfolioItem, 'type'> {
  type: 'publications';
  title: string;
  authors: string[];
  journal?: string;
  year: string;
  doi?: string;
  url?: string;
  impactFactor?: number;
  citations?: number;
}

export interface TeachingActivity extends Omit<PortfolioItem, 'type'> {
  type: 'teaching';
  courseName: string;
  courseCode?: string;
  semester: string;
  year: string;
  studentsCount?: number;
  evaluation?: number;
  description: string;
}

export interface Achievement extends Omit<PortfolioItem, 'type'> {
  type: 'achievements';
  title: string;
  issuer: string;
  date: string;
  category: 'certificate' | 'diploma' | 'award' | 'test' | 'other';
  score?: string;
  validityPeriod?: string;
  description?: string;
}

export interface AdditionalActivity extends Omit<PortfolioItem, 'type'> {
  type: 'additional';
  title: string;
  organization: string;
  role: string;
  startDate: string;
  endDate?: string;
  description: string;
  impact?: string;
}

export interface PortfolioDatabase {
  items: PortfolioItem[];
  nextId: number;
}

export const INITIAL_PORTFOLIO: PortfolioItem[] = [];
