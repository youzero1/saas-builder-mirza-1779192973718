import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Plus, Trash2, Eye } from 'lucide-react';
import { useApp } from '@/hooks/useAppContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { orgDashboards, addDashboard, deleteDashboard, currentUser } = useApp();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');

  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'member';

  function handleCreate() {
    if (!name.trim()) return;
    const id = addDashboard(name.trim());
    setName('');
    setCreateOpen(false);
    navigate(`/dashboards/${id}`);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboards</h1>
          <p className="text-sm text-slate-500 mt-0.5">Build and manage your custom dashboards</p>
        </div>
        {canEdit && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4" /> New Dashboard
          </Button>
        )}
      </div>

      {/* Grid */}
      {orgDashboards.length === 0 ? (
        <EmptyState
          icon={LayoutDashboard}
          title="No dashboards yet"
          description="Create your first custom dashboard to visualize your team metrics."
          action={canEdit ? <Button onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4" /> New Dashboard</Button> : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {orgDashboards.map((dash) => (
            <Card key={dash.id} className="hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                  <LayoutDashboard className="w-5 h-5 text-brand-600" />
                </div>
                {canEdit && (
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteDashboard(dash.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{dash.name}</h3>
              <p className="text-xs text-slate-400 mb-3">
                {dash.widgets.length} widget{dash.widgets.length !== 1 ? 's' : ''} · Updated {formatDate(dash.updatedAt)}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="info">{dash.widgets.length} widgets</Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 w-full justify-center"
                onClick={() => navigate(`/dashboards/${dash.id}`)}
              >
                <Eye className="w-4 h-4" /> Open Dashboard
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Dashboard">
        <div className="space-y-4">
          <Input
            label="Dashboard Name"
            placeholder="e.g. Executive Overview"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
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
