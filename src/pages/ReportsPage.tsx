import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileBarChart2, Plus, Trash2, Eye } from 'lucide-react';
import { useApp } from '@/hooks/useAppContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';
import { MetricType, ReportStatus } from '@/types';

const METRIC_OPTIONS = [
  { value: 'hr', label: 'HR Metrics' },
  { value: 'sales', label: 'Sales Performance' },
  { value: 'project', label: 'Project Tracking' },
];

export default function ReportsPage() {
  const { orgReports, addReport, deleteReport, currentUser } = useApp();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [metricType, setMetricType] = useState<MetricType>('hr');

  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'member';

  function handleCreate() {
    if (!name.trim()) return;
    const id = addReport({ name: name.trim(), description, metricType, status: 'draft' });
    setName('');
    setDescription('');
    setCreateOpen(false);
    navigate(`/reports/${id}`);
  }

  function statusVariant(s: ReportStatus) {
    return s === 'published' ? 'success' : 'warning';
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="text-sm text-slate-500 mt-0.5">Create and manage data reports</p>
        </div>
        {canEdit && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4" /> New Report
          </Button>
        )}
      </div>

      {orgReports.length === 0 ? (
        <EmptyState
          icon={FileBarChart2}
          title="No reports yet"
          description="Create your first report to share insights with your team."
          action={canEdit ? <Button onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4" /> New Report</Button> : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {orgReports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <FileBarChart2 className="w-5 h-5 text-blue-600" />
                </div>
                {canEdit && (
                  <button
                    onClick={() => deleteReport(report.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{report.name}</h3>
              <p className="text-xs text-slate-400 mb-3 line-clamp-2">{report.description || 'No description'}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={statusVariant(report.status)}>{report.status}</Badge>
                <Badge variant="default" className="capitalize">{report.metricType}</Badge>
              </div>
              <p className="text-xs text-slate-400 mt-2">Updated {formatDate(report.updatedAt)}</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 w-full justify-center"
                onClick={() => navigate(`/reports/${report.id}`)}
              >
                <Eye className="w-4 h-4" /> Open Report
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Report">
        <div className="space-y-4">
          <Input
            label="Report Name"
            placeholder="e.g. Q2 Sales Summary"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Description"
            placeholder="Brief description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Select
            label="Data Category"
            value={metricType}
            onChange={(e: any) => setMetricType(e.target.value as MetricType)}
            options={METRIC_OPTIONS}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!name.trim()}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
