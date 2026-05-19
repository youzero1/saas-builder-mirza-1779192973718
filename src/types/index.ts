export type Role = 'admin' | 'member' | 'viewer';

export type OrgStatus = 'active' | 'inactive';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  status: OrgStatus;
}

export interface User {
  id: string;
  orgId: string;
  name: string;
  email: string;
  role: Role;
  avatarInitials: string;
  joinedAt: string;
  status: 'active' | 'invited' | 'inactive';
}

export type MetricType = 'hr' | 'sales' | 'project';

export interface MetricEntry {
  id: string;
  orgId: string;
  createdBy: string;
  type: MetricType;
  label: string;
  value: number;
  unit: string;
  date: string;
  createdAt: string;
}

export type WidgetType = 'kpi' | 'bar' | 'line' | 'pie' | 'table';

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  metricType: MetricType;
  size: 'sm' | 'md' | 'lg';
  color: string;
  position: number;
}

export interface Dashboard {
  id: string;
  orgId: string;
  name: string;
  createdBy: string;
  widgets: DashboardWidget[];
  createdAt: string;
  updatedAt: string;
}

export type ReportStatus = 'draft' | 'published';

export interface Report {
  id: string;
  orgId: string;
  name: string;
  description: string;
  metricType: MetricType;
  status: ReportStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppSession {
  currentUser: User;
  currentOrg: Organization;
}
