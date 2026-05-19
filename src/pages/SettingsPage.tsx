import { useState } from 'react';
import { Building2, Save, AlertTriangle, RefreshCw } from 'lucide-react';
import { useApp } from '@/hooks/useAppContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { storage } from '@/lib/storage';
import { seedIfEmpty } from '@/lib/seed';

export default function SettingsPage() {
  const { currentOrg, currentUser, orgs, users } = useApp();
  const [orgName, setOrgName] = useState(currentOrg?.name ?? '');
  const [saved, setSaved] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleReset() {
    if (!confirm('Reset all demo data? This will reload the page.')) return;
    storage.clearAll();
    seedIfEmpty();
    window.location.reload();
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your organization settings</p>
      </div>

      {/* Org Info */}
      <Card>
        <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4" /> Organization
        </h2>
        <div className="space-y-4">
          <Input
            label="Organization Name"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            disabled={!isAdmin}
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Status</label>
            <Badge variant="success" className="w-fit">{currentOrg?.status}</Badge>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Created</label>
            <p className="text-sm text-slate-600">{formatDate(currentOrg?.createdAt ?? '')}</p>
          </div>
          {isAdmin && (
            <Button onClick={handleSave}>
              <Save className="w-4 h-4" />
              {saved ? 'Saved!' : 'Save Changes'}
            </Button>
          )}
        </div>
      </Card>

      {/* Current User */}
      <Card>
        <h2 className="text-base font-semibold text-slate-900 mb-4">Your Profile</h2>
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: '#6366f1' }}
          >
            {currentUser?.avatarInitials}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{currentUser?.name}</p>
            <p className="text-sm text-slate-500">{currentUser?.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-slate-500">Role</p>
            <Badge variant={currentUser?.role === 'admin' ? 'danger' : currentUser?.role === 'member' ? 'info' : 'default'} className="capitalize mt-1">
              {currentUser?.role}
            </Badge>
          </div>
          <div>
            <p className="text-slate-500">Joined</p>
            <p className="text-slate-800 mt-1">{formatDate(currentUser?.joinedAt ?? '')}</p>
          </div>
        </div>
      </Card>

      {/* All Orgs (admin overview) */}
      {isAdmin && (
        <Card>
          <h2 className="text-base font-semibold text-slate-900 mb-4">All Organizations (Demo)</h2>
          <div className="space-y-2">
            {orgs.map((org) => {
              const count = users.filter((u) => u.orgId === org.id).length;
              return (
                <div key={org.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-800">{org.name}</p>
                    <p className="text-xs text-slate-400">{count} members · Created {formatDate(org.createdAt)}</p>
                  </div>
                  <Badge variant={org.status === 'active' ? 'success' : 'default'}>{org.status}</Badge>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Danger zone */}
      <Card className="border-red-200">
        <h2 className="text-base font-semibold text-red-600 mb-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Danger Zone
        </h2>
        <p className="text-sm text-slate-500 mb-4">Reset all demo data and start fresh. This cannot be undone.</p>
        <Button variant="danger" onClick={handleReset}>
          <RefreshCw className="w-4 h-4" /> Reset Demo Data
        </Button>
      </Card>
    </div>
  );
}
