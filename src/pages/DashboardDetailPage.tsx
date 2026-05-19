import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/hooks/useAppContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import EmptyState from '@/components/ui/EmptyState';
import { LayoutDashboard, Plus, Trash2, ArrowLeft } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { MetricType, DashboardWidget, WidgetType } from '@/types';
import { formatNumber } from '@/lib/utils';

function getLatestKPI(metrics: any[], metricType: MetricType): number {
  const filtered = metrics
    .filter((m) => m.type === metricType)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  if (!filtered.length) return 0;
  return filtered[0].value;
}

function getChartData(metrics: any[], metricType: MetricType) {
  const filtered = metrics.filter((m) => m.type === metricType);
  const byDate: Record<string, number> = {};
  filtered.forEach((m) => {
    if (!byDate[m.date]) byDate[m.date] = 0;
    byDate[m.date] += m.value;
  });
  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date: date.slice(0, 7), value }));
}

type WidgetCardProps = {
  widget: DashboardWidget;
  metrics: any[];
  onRemove: () => void;
  canEdit: boolean;
};

function WidgetCard({ widget, metrics, onRemove, canEdit }: WidgetCardProps) {
  if (widget.type === 'kpi') {
    const value = getLatestKPI(metrics, widget.metricType as MetricType);
    return (
      <Card className="relative">
        {canEdit && (
          <button
            onClick={onRemove}
            className="absolute top-3 right-3 p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{widget.title}</p>
        <p className="text-3xl font-bold" style={{ color: widget.color }}>
          {formatNumber(value)}
        </p>
        <p className="text-xs text-slate-400 mt-1 capitalize">{widget.metricType} metrics</p>
      </Card>
    );
  }

  const data = getChartData(metrics, widget.metricType as MetricType);

  return (
    <Card className={`relative ${widget.size === 'lg' ? 'col-span-2' : ''}`}>
      {canEdit && (
        <button
          onClick={onRemove}
          className="absolute top-3 right-3 p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors z-10"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
      <p className="text-sm font-semibold text-slate-700 mb-3">{widget.title}</p>
      <ResponsiveContainer width="100%" height={180}>
        {widget.type === 'line' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke={widget.color} strokeWidth={2} dot={false} />
          </LineChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" fill={widget.color} radius={[3, 3, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </Card>
  );
}

export default function DashboardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orgDashboards, orgMetrics, addWidget, removeWidget, currentUser } = useApp();

  const dashboard = orgDashboards.find((d) => d.id === id);
  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'member';

  const [showAdd, setShowAdd] = useState(false);
  const [widgetType, setWidgetType] = useState<WidgetType>('kpi');
  const [widgetMetric, setWidgetMetric] = useState<MetricType>('hr');
  const [widgetTitle, setWidgetTitle] = useState('');
  const [widgetColor, setWidgetColor] = useState('#6366f1');
  const [widgetSize, setWidgetSize] = useState<'sm' | 'md' | 'lg'>('sm');

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Dashboard not found.</p>
      </div>
    );
  }

  const handleAddWidget = () => {
    if (!widgetTitle.trim()) return;
    addWidget(dashboard.id, {
      type: widgetType,
      title: widgetTitle,
      metricType: widgetMetric,
      size: widgetSize,
      color: widgetColor,
    });
    setWidgetTitle('');
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboards')}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{dashboard.name}</h1>
            <p className="text-sm text-slate-500">{dashboard.widgets.length} widget{dashboard.widgets.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        {canEdit && (
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4" /> Add Widget
          </Button>
        )}
      </div>

      {/* Widgets Grid */}
      {dashboard.widgets.length === 0 ? (
        <EmptyState
          icon={LayoutDashboard}
          title="No widgets yet"
          description="Add your first widget to start visualizing your metrics."
          action={
            canEdit ? (
              <Button onClick={() => setShowAdd(true)}>
                <Plus className="w-4 h-4" /> Add Widget
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboard.widgets
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((widget) => (
              <WidgetCard
                key={widget.id}
                widget={widget}
                metrics={orgMetrics}
                onRemove={() => removeWidget(dashboard.id, widget.id)}
                canEdit={canEdit}
              />
            ))}
        </div>
      )}

      {/* Add Widget Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Widget">
        <div className="space-y-4">
          <Input
            label="Widget Title"
            value={widgetTitle}
            onChange={(e) => setWidgetTitle(e.target.value)}
            placeholder="e.g. Monthly Revenue"
          />
          <Select
            label="Widget Type"
            value={widgetType}
            onChange={(e) => setWidgetType(e.target.value as WidgetType)}
            options={[
              { value: 'kpi', label: 'KPI Card' },
              { value: 'line', label: 'Line Chart' },
              { value: 'bar', label: 'Bar Chart' },
            ]}
          />
          <Select
            label="Metric Category"
            value={widgetMetric}
            onChange={(e) => setWidgetMetric(e.target.value as MetricType)}
            options={[
              { value: 'hr', label: 'HR' },
              { value: 'sales', label: 'Sales' },
              { value: 'project', label: 'Project' },
            ]}
          />
          <Select
            label="Size"
            value={widgetSize}
            onChange={(e) => setWidgetSize(e.target.value as 'sm' | 'md' | 'lg')}
            options={[
              { value: 'sm', label: 'Small' },
              { value: 'md', label: 'Medium' },
              { value: 'lg', label: 'Large' },
            ]}
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Color</label>
            <input
              type="color"
              value={widgetColor}
              onChange={(e) => setWidgetColor(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 cursor-pointer"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAddWidget} disabled={!widgetTitle.trim()}>Add Widget</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
