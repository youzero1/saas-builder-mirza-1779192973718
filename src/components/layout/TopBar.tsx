import { useApp } from '@/hooks/useAppContext';
import { Building2, ChevronDown, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function TopBar() {
  const { currentUser, currentOrg, orgs, users, switchUser } = useApp();
  const [open, setOpen] = useState(false);

  if (!currentUser || !currentOrg) return null;

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Building2 className="w-4 h-4" />
        <span className="font-medium text-slate-900">{currentOrg.name}</span>
        <span className="text-slate-300">·</span>
        <span className="capitalize bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
          {currentUser.role}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Demo user switcher */}
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Switch User (Demo)</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-1 w-72 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1">
              {orgs.map((org) => {
                const orgUsers = users.filter((u) => u.orgId === org.id);
                return (
                  <div key={org.id}>
                    <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      {org.name}
                    </div>
                    {orgUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => { switchUser(u.id, org.id); setOpen(false); }}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-slate-50 transition-colors',
                          u.id === currentUser.id ? 'bg-brand-50 text-brand-700' : 'text-slate-700'
                        )}
                      >
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ backgroundColor: '#6366f1' }}
                        >
                          {u.avatarInitials}
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{u.name}</div>
                          <div className="text-xs text-slate-400 capitalize">{u.role}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ backgroundColor: '#6366f1' }}
        >
          {currentUser.avatarInitials}
        </div>
      </div>
    </header>
  );
}
