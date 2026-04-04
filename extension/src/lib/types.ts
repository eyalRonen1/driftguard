export interface Monitor {
  id: string;
  name: string;
  url: string;
  checkFrequency: string;
  cssSelector?: string;
  isActive: boolean;
  isPaused: boolean;
  healthStatus: string;
  lastCheckedAt: string | null;
  totalChanges: number;
  tags?: string;
}

export interface Change {
  id: string;
  monitorId: string;
  summary: string;
  changeType: string;
  importanceScore: number;
  createdAt: string;
  tags?: string;
}

export interface OrgInfo {
  id: string;
  name: string;
  plan: string;
}

export interface UserInfo {
  email: string;
  name: string;
}
