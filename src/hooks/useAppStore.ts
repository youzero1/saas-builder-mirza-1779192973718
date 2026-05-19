import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '@/lib/storage';
import { seedIfEmpty } from '@/lib/seed';
import {
  Organization, User, MetricEntry, Dashboard, Report,
  DashboardWidget, MetricType, Role, ReportStatus, WidgetType
} from '@/types';

export function useAppStore() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [metrics, setMetrics] = useState<MetricEntry[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [sessionUserId, setSessionUserId] = useState<string>('');
  const [sessionOrgId, setSessionOrgId] = useState<string>('');

  useEffect(() => {
    const s = seedIfEmpty();
    setSessionUserId(s.userId);
    setSessionOrgId(s.orgId);
    setOrgs(storage.getOrgs());
    setUsers(storage.getUsers());
    setMetrics(storage.getMetrics());
    setDashboards(storage.getDashboards());
    setReports(storage.getReports());
  }, []);

  const currentUser = users.find((u) => u.id === sessionUserId) ?? null;
  const currentOrg = orgs.find((o) => o.id === sessionOrgId) ?? null;

  const orgUsers = users.filter((u) => u.orgId === sessionOrgId);
  const orgMetrics = metrics.filter((m) => m.orgId === sessionOrgId);
  const orgDashboards = dashboards.filter((d) => d.orgId === sessionOrgId);
  const orgReports = reports.filter((r) => r.orgId === sessionOrgId);

  // Switch org/user (for demo)
  const switchUser = useCallback((userId: string, orgId: string) => {
    const s = { userId, orgId };
    storage.saveSession(s);
    setSessionUserId(userId);
    setSessionOrgId(orgId);
  }, []);

  // ── Metrics ──────────────────────────────────────────────────────────
  const addMetric = useCallback((data: Omit<MetricEntry, 'id' | 'orgId' | 'createdBy' | 'createdAt'>) => {
    const entry: MetricEntry = {
      ...data,
      id: uuidv4(),
      orgId: sessionOrgId,
      createdBy: sessionUserId,
      createdAt: new Date().toISOString(),
    };
    const updated = [...metrics, entry];
    setMetrics(updated);
    storage.saveMetrics(updated);
  }, [metrics, sessionOrgId, sessionUserId]);

  const deleteMetric = useCallback((id: string) => {
    const updated = metrics.filter((m) => m.id !== id);
    setMetrics(updated);
    storage.saveMetrics(updated);
  }, [metrics]);

  // ── Dashboards ───────────────────────────────────────────────────────
  const addDashboard = useCallback((name: string) => {
    const d: Dashboard = {
      id: uuidv4(),
      orgId: sessionOrgId,
      name,
      createdBy: sessionUserId,
      widgets: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...dashboards, d];
    setDashboards(updated);
    storage.saveDashboards(updated);
    return d.id;
  }, [dashboards, sessionOrgId, sessionUserId]);

  const updateDashboard = useCallback((id: string, patch: Partial<Pick<Dashboard, 'name' | 'widgets'>>) => {
    const updated = dashboards.map((d) =>
      d.id === id ? { ...d, ...patch, updatedAt: new Date().toISOString() } : d
    );
    setDashboards(updated);
    storage.saveDashboards(updated);
  }, [dashboards]);

  const deleteDashboard = useCallback((id: string) => {
    const updated = dashboards.filter((d) => d.id !== id);
    setDashboards(updated);
    storage.saveDashboards(updated);
  }, [dashboards]);

  const addWidget = useCallback((
    dashboardId: string,
    widget: Omit<DashboardWidget, 'id' | 'position'>
  ) => {
    const dash = dashboards.find((d) => d.id === dashboardId);
    if (!dash) return;
    const newWidget: DashboardWidget = {
      ...widget,
      id: uuidv4(),
      position: dash.widgets.length,
    };
    const updatedWidgets = [...dash.widgets, newWidget];
    updateDashboard(dashboardId, { widgets: updatedWidgets });
  }, [dashboards, updateDashboard]);

  const removeWidget = useCallback((dashboardId: string, widgetId: string) => {
    const dash = dashboards.find((d) => d.id === dashboardId);
    if (!dash) return;
    const updatedWidgets = dash.widgets.filter((w) => w.id !== widgetId);
    updateDashboard(dashboardId, { widgets: updatedWidgets });
  }, [dashboards, updateDashboard]);

  // ── Reports ──────────────────────────────────────────────────────────
  const addReport = useCallback((data: Omit<Report, 'id' | 'orgId' | 'createdBy' | 'createdAt' | 'updatedAt'>) => {
    const r: Report = {
      ...data,
      id: uuidv4(),
      orgId: sessionOrgId,
      createdBy: sessionUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...reports, r];
    setReports(updated);
    storage.saveReports(updated);
    return r.id;
  }, [reports, sessionOrgId, sessionUserId]);

  const updateReport = useCallback((id: string, patch: Partial<Pick<Report, 'name' | 'description' | 'metricType' | 'status'>>) => {
    const updated = reports.map((r) =>
      r.id === id ? { ...r, ...patch, updatedAt: new Date().toISOString() } : r
    );
    setReports(updated);
    storage.saveReports(updated);
  }, [reports]);

  const deleteReport = useCallback((id: string) => {
    const updated = reports.filter((r) => r.id !== id);
    setReports(updated);
    storage.saveReports(updated);
  }, [reports]);

  // ── Users ────────────────────────────────────────────────────────────
  const inviteUser = useCallback((name: string, email: string, role: Role) => {
    const u: User = {
      id: uuidv4(),
      orgId: sessionOrgId,
      name,
      email,
      role,
      avatarInitials: name.split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase(),
      joinedAt: new Date().toISOString(),
      status: 'invited',
    };
    const updated = [...users, u];
    setUsers(updated);
    storage.saveUsers(updated);
  }, [users, sessionOrgId]);

  const updateUserRole = useCallback((userId: string, role: Role) => {
    const updated = users.map((u) => (u.id === userId ? { ...u, role } : u));
    setUsers(updated);
    storage.saveUsers(updated);
  }, [users]);

  const removeUser = useCallback((userId: string) => {
    const updated = users.filter((u) => u.id !== userId);
    setUsers(updated);
    storage.saveUsers(updated);
  }, [users]);

  return {
    // State
    orgs,
    users,
    metrics,
    dashboards,
    reports,
    currentUser,
    currentOrg,
    sessionUserId,
    sessionOrgId,
    // Filtered by org
    orgUsers,
    orgMetrics,
    orgDashboards,
    orgReports,
    // Actions
    switchUser,
    addMetric,
    deleteMetric,
    addDashboard,
    updateDashboard,
    deleteDashboard,
    addWidget,
    removeWidget,
    addReport,
    updateReport,
    deleteReport,
    inviteUser,
    updateUserRole,
    removeUser,
  };
}

export type AppStore = ReturnType<typeof useAppStore>;
