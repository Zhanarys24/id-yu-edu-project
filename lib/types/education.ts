export interface EducationCard {
  id: string;
  title: string;
  description: string;
  image: string;
  href: string;
  ctaLabel: string;
  category: 'education' | 'science' | 'upbringing';
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CardClick {
  id: string;
  cardId: string;
  userId: string;
  userEmail: string;
  userName: string;
  clickedAt: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface CardAnalytics {
  cardId: string;
  cardTitle: string;
  totalClicks: number;
  uniqueUsers: number;
  clicksByUser: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    clickCount: number;
    lastClick: string;
  }>;
  clicksByDate: Array<{
    date: string;
    clicks: number;
  }>;
}

export type EducationCategory = 'education' | 'science' | 'upbringing';

export interface UserClickData {
  userId: string;
  userName: string;
  userEmail: string;
  category: EducationCategory;
  cardId: string;
  cardTitle: string;
  clickedAt: string; // Last click time for this user-card interaction
  clickCount: number; // Total clicks for this user-card interaction
}

// API Application types
export interface ApiApplication {
  id: number;
  name: string;
  description: string | null;
  is_additional: boolean;
  url: string;
  image: string;
  can_iframe: boolean;
}

export interface ApiApplicationsResponse {
  count: number;
  size: number;
  next: string | null;
  previous: string | null;
  results: ApiApplication[];
}
