import { Organization, User, MetricEntry, Dashboard, Report } from '@/types';

const KEYS = {
  orgs: 'ws_orgs',
  users: 'ws_users',
  metrics: 'ws_metrics',
  dashboards: 'ws_dashboards',
  reports: 'ws_reports',
  session: 'ws_session',
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  // Orgs
  getOrgs: (): Organization[] => load<Organization[]>(KEYS.orgs, []),
  saveOrgs: (orgs: Organization[]) => save(KEYS.orgs, orgs),

  // Users
  getUsers: (): User[] => load<User[]>(KEYS.users, []),
  saveUsers: (users: User[]) => save(KEYS.users, users),

  // Metrics
  getMetrics: (): MetricEntry[] => load<MetricEntry[]>(KEYS.metrics, []),
  saveMetrics: (m: MetricEntry[]) => save(KEYS.metrics, m),

  // Dashboards
  getDashboards: (): Dashboard[] => load<Dashboard[]>(KEYS.dashboards, []),
  saveDashboards: (d: Dashboard[]) => save(KEYS.dashboards, d),

  // Reports
  getReports: (): Report[] => load<Report[]>(KEYS.reports, []),
  saveReports: (r: Report[]) => save(KEYS.reports, r),

  // Session
  getSession: (): { userId: string; orgId: string } | null =>
    load<{ userId: string; orgId: string } | null>(KEYS.session, null),
  saveSession: (s: { userId: string; orgId: string } | null) =>
    save(KEYS.session, s),

  clearAll: () => {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  },
};
