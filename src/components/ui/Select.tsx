import { cn } from '@/lib/utils';

type SelectOption = { value: string; label: string };

type SelectProps = {
  label?: string;
  options: SelectOption[];
  error?: string;
  className?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({ label, options, error, className, ...rest }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <select
        {...rest}
        className={cn(
          'w-full px-3 py-2 text-sm border rounded-lg outline-none transition-colors bg-white',
          'border-slate-200 text-slate-900',
          'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
          error && 'border-red-400',
          className
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
