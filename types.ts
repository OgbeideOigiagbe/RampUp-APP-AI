
export enum Topic {
  SECURITY = 'Security',
  ENTERPRISE_AI = 'Enterprise AI',
  IAM = 'Identity and Access Management'
}

export interface Article {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedDate?: string;
  summary: string[];
  topic: Topic;
  isRead: boolean;
  isSaved: boolean;
}

export interface Company {
  id: string;
  name: string;
  blogUrl: string;
}

export interface NewsCache {
  articles: Article[];
  lastUpdated: number;
}

export interface AppState {
  companies: Company[];
  readArticles: string[]; // IDs
  savedArticles: Article[];
  globalNews: NewsCache;
  companyNews: Record<string, NewsCache>; // Keyed by company ID
}
