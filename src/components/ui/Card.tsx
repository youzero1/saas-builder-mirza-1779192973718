import { cn } from '@/lib/utils';

type CardProps = {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
};

export default function Card({ children, className, padding = true }: CardProps) {
  return (
    <div className={cn('bg-white border border-slate-200 rounded-xl shadow-sm', padding && 'p-5', className)}>
      {children}
    </div>
  );
}
