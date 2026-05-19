import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Edit2, Save } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useApp } from '@/hooks/useAppContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { formatDate, formatNumber } from '@/lib/utils';
import { MetricType } from '@/types';

const METRIC_OPTIONS = [
  { value: 'hr', label: 'HR Metrics' },
  { value: 'sales', label: 'Sales Performance' },
  { value: 'project', label: 'Project Tracking' },
];

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orgReports, orgMetrics, updateReport, currentUser, orgUsers } = useApp();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editMetric, setEditMetric] = useState<MetricType>('hr');

  const report = orgReports.find((r) => r.id === id);
  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'member';

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-slate-500">Report not found.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/reports')}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      </div>
    );
  }

  const filtered = orgMetrics.filter((m) => m.type === report.metricType);
  const byDate: Record<string, Record<string, number>> = {};
  filtered.forEach((m) => {
    if (!byDate[m.date]) byDate[m.date] = {};
    byDate[m.date][m.label] = m.value;
  });
  const chartData = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({ date: date.slice(0, 7), ...vals }));

  const keys = chartData.length > 0 ? Object.keys(chartData[0]).filter((k) => k !== 'date') : [];

  const latestMetrics = Object.values(
    filtered.reduce((acc: Record<string, any>, m) => {
      if (!acc[m.label] || m.date > acc[m.label].date) acc[m.label] = m;
      return acc;
    }, {})
  );

  const author = orgUsers.find((u) => u.id === report.createdBy);

  function startEdit() {
    setEditName(report!.name);
    setEditDesc(report!.description);
    setEditMetric(report!.metricType);
    setEditing(true);
  }

  function saveEdit() {
    updateReport(report!.id, { name: editName, description: editDesc, metricType: editMetric });
    setEditing(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/reports')} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{report.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant={report.status === 'published' ? 'success' : 'warning'}>{report.status}</Badge>
              <span className="text-xs text-slate-400">by {author?.name ?? 'Unknown'} · {formatDate(report.updatedAt)}</span>
            </div>
          </div>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            {!editing ? (
              <>
                <Button variant="outline" size="sm" onClick={startEdit}><Edit2 className="w-4 h-4" /> Edit</Button>
                {report.status === 'draft' && (
                  <Button size="sm" onClick={() => updateReport(report.id, { status: 'published' })}>
                    <Send className="w-4 h-4" /> Publish
                  </Button>
                )}
              </>
            ) : (
              <Button size="sm" onClick={saveEdit}><Save className="w-4 h-4" /> Save</Button>
            )}
          </div>
        )}
      </div>

      {editing ? (
        <Card>
          <div className="space-y-4">
            <Input label="Name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            <Input label="Description" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
            <Select
              label="Data Category"
              value={editMetric}
              onChange={(e: any) => setEditMetric(e.target.value as MetricType)}
              options={METRIC_OPTIONS}
            />
            <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </Card>
      ) : (
        <Card>
          <p className="text-sm text-slate-600">{report.description || <span className="text-slate-400 italic">No description</span>}</p>
        </Card>
      )}

      {/* KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
        {latestMetrics.slice(0, 5).map((m: any) => (
          <Card key={m.id} className="text-center">
            <p className="text-xs text-slate-500 mb-1">{m.label}</p>
            <p className="text-xl font-bold text-slate-900">{formatNumber(m.value)}</p>
            <p className="text-xs text-slate-400">{m.unit}</p>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Trend Over Time (Bar)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              {keys.slice(0, 4).map((key, i) => (
                <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} radius={[3, 3, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Trend Over Time (Line)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              {keys.slice(0, 4).map((key, i) => (
                <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Raw data table */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">Raw Data</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Metric</th>
                <th className="text-right px-5 py-3 text-slate-500 font-medium">Value</th>
                <th className="text-right px-5 py-3 text-slate-500 font-medium">Unit</th>
                <th className="text-right px-5 py-3 text-slate-500 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20).map((m) => (
                <tr key={m.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                  <td className="px-5 py-3 text-slate-700">{m.label}</td>
                  <td className="px-5 py-3 text-right font-medium">{formatNumber(m.value)}</td>
                  <td className="px-5 py-3 text-right text-slate-400">{m.unit}</td>
                  <td className="px-5 py-3 text-right text-slate-400">{m.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
