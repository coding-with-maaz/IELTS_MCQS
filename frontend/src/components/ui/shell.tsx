import { cn } from '@/lib/utils';

interface ShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'sidebar';
}

export function Shell({
  children,
  variant = 'default',
  className,
  ...props
}: ShellProps) {
  return (
    <div
      className={cn(
        'grid items-start gap-8',
        {
          'lg:grid-cols-[1fr_200px]': variant === 'sidebar',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
} 