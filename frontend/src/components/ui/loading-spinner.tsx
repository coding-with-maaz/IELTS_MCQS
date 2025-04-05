import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  centered?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export function LoadingSpinner({
  size = 'md',
  centered = false,
  className,
  ...props
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center',
        centered && 'min-h-[200px]',
        className
      )}
      {...props}
    >
      <Loader2 className={cn('animate-spin', sizeClasses[size])} />
    </div>
  );
} 