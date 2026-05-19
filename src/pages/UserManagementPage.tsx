import { useState } from 'react';
import { Users, Plus, Trash2, Shield, Mail } from 'lucide-react';
import { useApp } from '@/hooks/useAppContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';
import { Role } from '@/types';

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
  { value: 'viewer', label: 'Viewer' },
];

const roleVariant: Record<Role, any> = {
  admin: 'danger',
  member: 'info',
  viewer: 'default',
};

const statusVariant: Record<string, any> = {
  active: 'success',
  invited: 'warning',
  inactive: 'default',
};

export default function UserManagementPage() {
  const { orgUsers, currentUser, inviteUser, updateUserRole, removeUser } = useApp();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('member');

  const isAdmin = currentUser?.role === 'admin';

  function handleInvite() {
    if (!name.trim() || !email.trim()) return;
    inviteUser(name.trim(), email.trim(), role);
    setName('');
    setEmail('');
    setRole('member');
    setInviteOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team</h1>
          <p className="text-sm text-slate-500 mt-0.5">{orgUsers.length} member{orgUsers.length !== 1 ? 's' : ''} in your organization</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setInviteOpen(true)}>
            <Plus className="w-4 h-4" /> Invite Member
          </Button>
        )}
      </div>

      {/* Role Summary */}
      <div className="grid grid-cols-3 gap-4">
        {(['admin', 'member', 'viewer'] as Role[]).map((r) => {
          const count = orgUsers.filter((u) => u.role === r).length;
          return (
            <Card key={r} className="text-center">
              <Shield className="w-5 h-5 mx-auto mb-2 text-slate-400" />
              <p className="text-2xl font-bold text-slate-900">{count}</p>
              <p className="text-xs text-slate-500 capitalize mt-1">{r}s</p>
            </Card>
          );
        })}
      </div>

      {orgUsers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No team members"
          description="Invite your first team member to collaborate."
          action={isAdmin ? <Button onClick={() => setInviteOpen(true)}><Plus className="w-4 h-4" /> Invite Member</Button> : undefined}
        />
      ) : (
        <Card padding={false}>
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Member</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Role</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Status</th>
                <th className="text-right px-5 py-3 text-slate-500 font-medium">Joined</th>
                {isAdmin && <th className="px-5 py-3" />}
              </tr>
            </thead>
            <tbody>
              {orgUsers.map((user) => (
                <tr key={user.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: '#6366f1' }}
                      >
                        {user.avatarInitials}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" />{user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {isAdmin && user.id !== currentUser?.id ? (
                      <select
                        value={user.role}
                        onChange={(e: any) => updateUserRole(user.id, e.target.value as Role)}
                        className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700 focus:outline-none focus:border-brand-500"
                      >
                        {ROLE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    ) : (
                      <Badge variant={roleVariant[user.role]} className="capitalize">{user.role}</Badge>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={statusVariant[user.status]} className="capitalize">{user.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-right text-slate-400">{formatDate(user.joinedAt)}</td>
                  {isAdmin && (
                    <td className="px-5 py-3 text-right">
                      {user.id !== currentUser?.id && (
                        <button
                          onClick={() => removeUser(user.id)}
                          className="p-1.5 rounded hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite Team Member">
        <div className="space-y-4">
          <Input label="Full Name" placeholder="e.g. Jane Doe" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" type="email" placeholder="jane@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Select
            label="Role"
            value={role}
            onChange={(e: any) => setRole(e.target.value as Role)}
            options={ROLE_OPTIONS}
          />
          <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500">
            <strong>Role permissions:</strong>
            <ul className="mt-1 space-y-0.5">
              <li>· <strong>Admin</strong> — full access, manage team & settings</li>
              <li>· <strong>Member</strong> — create/edit dashboards and reports</li>
              <li>· <strong>Viewer</strong> — read-only access to dashboards</li>
            </ul>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button onClick={handleInvite} disabled={!name.trim() || !email.trim()}>Send Invite</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
