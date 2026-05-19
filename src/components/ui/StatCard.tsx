import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

type StatCardProps = {
  title: string;
  value: string | number;
  change?: number;
  unit?: string;
  icon?: LucideIcon;
  color?: string;
  className?: string;
};

export default function StatCard({ title, value, change, unit, icon: Icon, color = '#6366f1', className }: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className={cn('bg-white border border-slate-200 rounded-xl p-5 shadow-sm', className)}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        {Icon && (
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
        )}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-slate-900">{value}</span>
        {unit && <span className="text-sm text-slate-400 mb-0.5">{unit}</span>}
      </div>
      {change !== undefined && (
        <div className={cn('flex items-center gap-1 mt-2 text-xs font-medium', isPositive ? 'text-green-600' : 'text-red-500')}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{Math.abs(change)}% vs last period</span>
        </div>
      )}
    </div>
  );
}
