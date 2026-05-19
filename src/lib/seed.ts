import { v4 as uuidv4 } from 'uuid';
import { storage } from '@/lib/storage';
import { Organization, User, MetricEntry, Dashboard, Report } from '@/types';

export function seedIfEmpty(): { userId: string; orgId: string } {
  const existingOrgs = storage.getOrgs();
  if (existingOrgs.length > 0) {
    const session = storage.getSession();
    if (session) return session;
    const firstOrg = existingOrgs[0];
    const firstUser = storage.getUsers().find((u) => u.orgId === firstOrg.id);
    const s = { userId: firstUser?.id ?? '', orgId: firstOrg.id };
    storage.saveSession(s);
    return s;
  }

  const org1Id = uuidv4();
  const org2Id = uuidv4();

  const orgs: Organization[] = [
    { id: org1Id, name: 'Acme Corp', slug: 'acme', createdAt: '2024-01-10T00:00:00Z', status: 'active' },
    { id: org2Id, name: 'Globex Inc', slug: 'globex', createdAt: '2024-02-15T00:00:00Z', status: 'active' },
  ];

  const adminId = uuidv4();
  const member1Id = uuidv4();
  const member2Id = uuidv4();
  const viewer1Id = uuidv4();
  const globexAdminId = uuidv4();

  const users: User[] = [
    { id: adminId, orgId: org1Id, name: 'Alice Johnson', email: 'alice@acme.com', role: 'admin', avatarInitials: 'AJ', joinedAt: '2024-01-10T00:00:00Z', status: 'active' },
    { id: member1Id, orgId: org1Id, name: 'Bob Smith', email: 'bob@acme.com', role: 'member', avatarInitials: 'BS', joinedAt: '2024-01-15T00:00:00Z', status: 'active' },
    { id: member2Id, orgId: org1Id, name: 'Carol White', email: 'carol@acme.com', role: 'member', avatarInitials: 'CW', joinedAt: '2024-02-01T00:00:00Z', status: 'active' },
    { id: viewer1Id, orgId: org1Id, name: 'David Lee', email: 'david@acme.com', role: 'viewer', avatarInitials: 'DL', joinedAt: '2024-03-01T00:00:00Z', status: 'active' },
    { id: globexAdminId, orgId: org2Id, name: 'Eve Martinez', email: 'eve@globex.com', role: 'admin', avatarInitials: 'EM', joinedAt: '2024-02-15T00:00:00Z', status: 'active' },
  ];

  const now = new Date();
  const metrics: MetricEntry[] = [];

  const hrLabels = ['Headcount', 'Attrition Rate', 'Open Positions', 'Avg Tenure', 'Training Hours'];
  const hrUnits = ['people', '%', 'positions', 'years', 'hours'];
  const salesLabels = ['Revenue', 'New Deals', 'Pipeline Value', 'Win Rate', 'Avg Deal Size'];
  const salesUnits = ['$K', 'deals', '$K', '%', '$K'];
  const projectLabels = ['Active Projects', 'Completed Tasks', 'Overdue Tasks', 'Sprint Velocity', 'Bug Count'];
  const projectUnits = ['projects', 'tasks', 'tasks', 'pts', 'bugs'];

  for (let i = 0; i < 6; i++) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - (5 - i));
    const dateStr = date.toISOString().split('T')[0];

    hrLabels.forEach((label, idx) => {
      metrics.push({
        id: uuidv4(), orgId: org1Id, createdBy: adminId,
        type: 'hr', label, value: Math.round(50 + Math.random() * 200),
        unit: hrUnits[idx], date: dateStr, createdAt: date.toISOString(),
      });
    });
    salesLabels.forEach((label, idx) => {
      metrics.push({
        id: uuidv4(), orgId: org1Id, createdBy: member1Id,
        type: 'sales', label, value: Math.round(100 + Math.random() * 500),
        unit: salesUnits[idx], date: dateStr, createdAt: date.toISOString(),
      });
    });
    projectLabels.forEach((label, idx) => {
      metrics.push({
        id: uuidv4(), orgId: org1Id, createdBy: member2Id,
        type: 'project', label, value: Math.round(10 + Math.random() * 100),
        unit: projectUnits[idx], date: dateStr, createdAt: date.toISOString(),
      });
    });
  }

  const dash1Id = uuidv4();
  const dashboards: Dashboard[] = [
    {
      id: dash1Id, orgId: org1Id, name: 'Executive Overview', createdBy: adminId,
      createdAt: '2024-01-20T00:00:00Z', updatedAt: '2024-04-01T00:00:00Z',
      widgets: [
        { id: uuidv4(), type: 'kpi', title: 'Total Headcount', metricType: 'hr', size: 'sm', color: '#6366f1', position: 0 },
        { id: uuidv4(), type: 'kpi', title: 'Revenue (this month)', metricType: 'sales', size: 'sm', color: '#22c55e', position: 1 },
        { id: uuidv4(), type: 'kpi', title: 'Active Projects', metricType: 'project', size: 'sm', color: '#f59e0b', position: 2 },
        { id: uuidv4(), type: 'line', title: 'Sales Trend', metricType: 'sales', size: 'lg', color: '#6366f1', position: 3 },
        { id: uuidv4(), type: 'bar', title: 'HR Metrics', metricType: 'hr', size: 'md', color: '#3b82f6', position: 4 },
        { id: uuidv4(), type: 'bar', title: 'Project Health', metricType: 'project', size: 'md', color: '#f59e0b', position: 5 },
      ],
    },
  ];

  const reports: Report[] = [
    {
      id: uuidv4(), orgId: org1Id, name: 'Q1 HR Summary', description: 'Quarterly HR metrics overview',
      metricType: 'hr', status: 'published', createdBy: adminId,
      createdAt: '2024-03-31T00:00:00Z', updatedAt: '2024-04-01T00:00:00Z',
    },
    {
      id: uuidv4(), orgId: org1Id, name: 'Sales Performance Report', description: 'Monthly sales KPIs and trends',
      metricType: 'sales', status: 'published', createdBy: member1Id,
      createdAt: '2024-04-01T00:00:00Z', updatedAt: '2024-04-02T00:00:00Z',
    },
    {
      id: uuidv4(), orgId: org1Id, name: 'Project Status Q2', description: 'Project tracking and velocity metrics',
      metricType: 'project', status: 'draft', createdBy: member2Id,
      createdAt: '2024-04-10T00:00:00Z', updatedAt: '2024-04-10T00:00:00Z',
    },
  ];

  storage.saveOrgs(orgs);
  storage.saveUsers(users);
  storage.saveMetrics(metrics);
  storage.saveDashboards(dashboards);
  storage.saveReports(reports);

  const session = { userId: adminId, orgId: org1Id };
  storage.saveSession(session);
  return session;
}
