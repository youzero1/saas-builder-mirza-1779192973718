import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, BarChart3, LineChart, PieChart, Table2, Hash
} from 'lucide-react';
import {
  BarChart, Bar, LineChart as ReLineChart, Line,
  PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useApp } from '@/hooks/useAppContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import { cn, formatNumber } from '@/lib/utils';
import { MetricType, WidgetType, DashboardWidget } from '@/types';

const WIDGET_TYPES: { value: WidgetType; label: string; icon: any }[] = [
  { value: 'kpi', label: 'KPI Card', icon: Hash },
  { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { value: 'line', label: 'Line Chart', icon: LineChart },
  { value: 'pie', label: 'Pie Chart', icon: PieChart },
  { value: 'table', label: 'Data Table', icon: Table2 },
];

const METRIC_TYPES: { value: MetricType; label: string }[] = [
  { value: 'hr', label: 'HR Metrics' },
  { value: 'sales', label: 'Sales Performance' },
  { value: 'project', label: 'Project Tracking' },
];

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

function buildChartData(metrics: any[], metricType: MetricType) {
  const filtered = metrics.filter((m) => m.type === metricType);
  const byDate: Record<string, Record<string, number>> = {};
  filtered.forEach((m) => {
    if (!byDate[m.date]) byDate[m.date] = {};
    byDate[m.date][m.label] = m.value;
  });
  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({ date: date.slice(0, 7), ...vals }));
}

function getLatestKPI(metrics: any[], metricType: MetricType, title: string): number {
  const filtered = metrics.filter((m) => m.type === metricType);
  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));
  return sorted[0]?.value ?? 0;
}

function WidgetRenderer({ widget, metrics }: { widget: DashboardWidget; metrics: any[] }) {
  const chartData = buildChartData(metrics, widget.metricType);
  const keys = chartData.length > 0 ? Object.keys(chartData[0]).filter((k) => k !== 'date') : [];

  if (widget.type === 'kpi') {
    const val = getLatestKPI(metrics, widget.metricType, widget.title);
    return (
      <div className="flex flex-col justify-center h-full">
        <p className="text-3xl font-bold text-slate-900">{formatNumber(val)}</p>
        <p className="text-sm text-slate-400 mt-1 capitalize">{widget.metricType} metric</p>
      </div>
    );
  }

  if (widget.type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          {keys.slice(0, 4).map((key, i) => (
            <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} radius={[3, 3, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (widget.type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={200}>
        <ReLineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          {keys.slice(0, 4).map((key, i) => (
            <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} />
          ))}
        </ReLineChart>
      </ResponsiveContainer>
    );
  }

  if (widget.type === 'pie') {
    const latestDate = chartData[chartData.length - 1];
    const pieData = latestDate
      ? Object.entries(latestDate)
          .filter(([k]) => k !== 'date')
          .map(([name, value]) => ({ name, value: Number(value) }))
      : [];
    return (
      <ResponsiveContainer width="100%" height={200}>
        <RePieChart>
          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
            {pieData.map((_: any, i: number) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </RePieChart>
      </ResponsiveContainer>
    );
  }

  if (widget.type === 'table') {
    const filtered = metrics.filter((m) => m.type === widget.metricType);
    const recent = [...filtered].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-1.5 text-slate-500 font-medium">Metric</th>
              <th className="text-right py-1.5 text-slate-500 font-medium">Value</th>
              <th className="text-right py-1.5 text-slate-500 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((m: any) => (
              <tr key={m.id} className="border-b border-slate-50">
                <td className="py-1.5 text-slate-700">{m.label}</td>
                <td className="py-1.5 text-right font-medium">{m.value} {m.unit}</td>
                <td className="py-1.5 text-right text-slate-400">{m.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return null;
}

export default function DashboardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orgDashboards, orgMetrics, addWidget, removeWidget, currentUser } = useApp();
  const [addOpen, setAddOpen] = useState(false);
  const [widgetType, setWidgetType] = useState<WidgetType>('kpi');
  const [metricType, setMetricType] = useState<MetricType>('hr');
  const [widgetTitle, setWidgetTitle] = useState('');

  const dashboard = orgDashboards.find((d) => d.id === id);
  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'member';

  if (!dashboard) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-slate-500">Dashboard not found.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/dashboards')}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      </div>
    );
  }

  function handleAddWidget() {
    if (!widgetTitle.trim()) return;
    addWidget(dashboard!.id, {
      type: widgetType,
      title: widgetTitle.trim(),
      metricType,
      size: widgetType === 'kpi' ? 'sm' : widgetType === 'line' ? 'lg' : 'md',
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    });
    setWidgetTitle('');
    setAddOpen(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboards')} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{dashboard.name}</h1>
            <p className="text-sm text-slate-500">{dashboard.widgets.length} widgets</p>
          </div>
        </div>
        {canEdit && (
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4" /> Add Widget
          </Button>
        )}
      </div>

      {/* Widgets */}
      {dashboard.widgets.length === 0 ? (
        <Card>
          <div className="py-12 flex flex-col items-center text-center">
            <BarChart3 className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No widgets yet</p>
            <p className="text-sm text-slate-400 mt-1 mb-4">Add your first widget to start visualizing data</p>
            {canEdit && <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4" /> Add Widget</Button>}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {dashboard.widgets
            .sort((a, b) => a.position - b.position)
            .map((widget) => (
              <Card
                key={widget.id}
                className={cn(
                  widget.size === 'lg' ? 'md:col-span-2 xl:col-span-3' : widget.size === 'md' ? 'md:col-span-1' : ''
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: widget.color }} />
                    <h3 className="font-semibold text-sm text-slate-800">{widget.title}</h3>
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => removeWidget(dashboard.id, widget.id)}
                      className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <WidgetRenderer widget={widget} metrics={orgMetrics} />
              </Card>
            ))}
        </div>
      )}

      {/* Add Widget Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Widget">
        <div className="space-y-4">
          <Input
            label="Widget Title"
            placeholder="e.g. Monthly Revenue"
            value={widgetTitle}
            onChange={(e) => setWidgetTitle(e.target.value)}
          />
          <Select
            label="Widget Type"
            value={widgetType}
            onChange={(e: any) => setWidgetType(e.target.value as WidgetType)}
            options={WIDGET_TYPES.map((t) => ({ value: t.value, label: t.label }))}
          />
          <Select
            label="Data Category"
            value={metricType}
            onChange={(e: any) => setMetricType(e.target.value as MetricType)}
            options={METRIC_TYPES}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddWidget} disabled={!widgetTitle.trim()}>Add Widget</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
