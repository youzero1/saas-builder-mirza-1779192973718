import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppContext } from '@/hooks/useAppContext';
import { useAppStore } from '@/hooks/useAppStore';
import AppLayout from '@/components/layout/AppLayout';
import DashboardPage from '@/pages/DashboardPage';
import DashboardDetailPage from '@/pages/DashboardDetailPage';
import ReportsPage from '@/pages/ReportsPage';
import ReportDetailPage from '@/pages/ReportDetailPage';
import UserManagementPage from '@/pages/UserManagementPage';
import MetricsPage from '@/pages/MetricsPage';
import SettingsPage from '@/pages/SettingsPage';

export default function App() {
  const store = useAppStore();

  return (
    <AppContext.Provider value={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboards" replace />} />
            <Route path="dashboards" element={<DashboardPage />} />
            <Route path="dashboards/:id" element={<DashboardDetailPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="reports/:id" element={<ReportDetailPage />} />
            <Route path="metrics" element={<MetricsPage />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboards" replace />} />
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  );
}
