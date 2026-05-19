import { useState } from 'react';
import { BarChart3, Plus, Trash2, Filter } from 'lucide-react';
import { useApp } from '@/hooks/useAppContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { formatDate, formatNumber } from '@/lib/utils';
import { MetricType } from '@/types';

const METRIC_TYPE_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'hr', label: 'HR Metrics' },
  { value: 'sales', label: 'Sales Performance' },
  { value: 'project', label: 'Project Tracking' },
];

const METRIC_INPUT_OPTIONS = [
  { value: 'hr', label: 'HR Metrics' },
  { value: 'sales', label: 'Sales Performance' },
  { value: 'project', label: 'Project Tracking' },
];

const typeVariant: Record<string, any> = {
  hr: 'info',
  sales: 'success',
  project: 'warning',
};

export default function MetricsPage() {
  const { orgMetrics, addMetric, deleteMetric, currentUser } = useApp();
  const [filter, setFilter] = useState<string>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('');
  const [metricType, setMetricType] = useState<MetricType>('hr');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'member';

  const filtered = filter === 'all' ? orgMetrics : orgMetrics.filter((m) => m.type === filter);
  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));

  function handleAdd() {
    if (!label.trim() || !value) return;
    addMetric({ type: metricType, label: label.trim(), value: parseFloat(value), unit, date });
    setLabel('');
    setValue('');
    setUnit('');
    setAddOpen(false);
  }

  // Summary stats
  const hrCount = orgMetrics.filter((m) => m.type === 'hr').length;
  const salesCount = orgMetrics.filter((m) => m.type === 'sales').length;
  const projectCount = orgMetrics.filter((m) => m.type === 'project').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Metrics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manually enter and manage data metrics</p>
        </div>
        {canEdit && (
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4" /> Add Metric
          </Button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <p className="text-2xl font-bold text-brand-600">{hrCount}</p>
          <p className="text-xs text-slate-500 mt-1">HR Entries</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-green-600">{salesCount}</p>
          <p className="text-xs text-slate-500 mt-1">Sales Entries</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-amber-600">{projectCount}</p>
          <p className="text-xs text-slate-500 mt-1">Project Entries</p>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Filter className="w-4 h-4 text-slate-400" />
        <div className="w-48">
          <Select
            options={METRIC_TYPE_OPTIONS}
            value={filter}
            onChange={(e: any) => setFilter(e.target.value)}
          />
        </div>
        <span className="text-sm text-slate-400">{sorted.length} entries</span>
      </div>

      {/* Table */}
      {sorted.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No metrics yet"
          description="Start adding metrics to populate your dashboards and reports."
          action={canEdit ? <Button onClick={() => setAddOpen(true)}><Plus className="w-4 h-4" /> Add Metric</Button> : undefined}
        />
      ) : (
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-5 py-3 text-slate-500 font-medium">Label</th>
                  <th className="text-left px-5 py-3 text-slate-500 font-medium">Category</th>
                  <th className="text-right px-5 py-3 text-slate-500 font-medium">Value</th>
                  <th className="text-left px-5 py-3 text-slate-500 font-medium">Unit</th>
                  <th className="text-right px-5 py-3 text-slate-500 font-medium">Date</th>
                  {canEdit && <th className="px-5 py-3" />}
                </tr>
              </thead>
              <tbody>
                {sorted.map((m) => (
                  <tr key={m.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                    <td className="px-5 py-3 font-medium text-slate-800">{m.label}</td>
                    <td className="px-5 py-3">
                      <Badge variant={typeVariant[m.type]} className="capitalize">{m.type}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-slate-900">{formatNumber(m.value)}</td>
                    <td className="px-5 py-3 text-slate-400">{m.unit}</td>
                    <td className="px-5 py-3 text-right text-slate-400">{formatDate(m.date)}</td>
                    {canEdit && (
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => deleteMetric(m.id)}
                          className="p-1.5 rounded hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Metric Entry">
        <div className="space-y-4">
          <Select
            label="Category"
            value={metricType}
            onChange={(e: any) => setMetricType(e.target.value as MetricType)}
            options={METRIC_INPUT_OPTIONS}
          />
          <Input
            label="Metric Label"
            placeholder="e.g. Headcount"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Value"
              type="number"
              placeholder="e.g. 142"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <Input
              label="Unit"
              placeholder="e.g. people"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
          </div>
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!label.trim() || !value}>Add Entry</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
