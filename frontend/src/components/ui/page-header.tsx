import { cn } from '@/lib/utils';

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  heading: string;
  text?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  heading,
  text,
  children,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-4 pb-8 pt-6 md:pb-10', className)} {...props}>
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl">
          {heading}
        </h1>
        {text && (
          <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
            {text}
          </p>
        )}
      </div>
      {children}
    </div>
  );
} 