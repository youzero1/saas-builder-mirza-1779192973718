import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

type InputProps = {
  label?: string;
  error?: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className, ...rest },
  ref
) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <input
        ref={ref}
        {...rest}
        className={cn(
          'w-full px-3 py-2 text-sm border rounded-lg outline-none transition-colors',
          'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400',
          'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
          error && 'border-red-400 focus:border-red-400 focus:ring-red-400/20',
          className
        )}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
});

export default Input;
