import { cn } from '@/utils/cn';

export type LoaderSize = 'sm' | 'md' | 'lg' | 'xl';

export interface LoaderProps {
  size?: LoaderSize;
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export function Loader({ size = 'md', text, fullScreen = false, className }: LoaderProps) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  };

  const content = (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <div
        className={cn(
          'border-odc-primary border-t-transparent rounded-full animate-spin',
          sizes[size]
        )}
      />
      {text && (
        <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-odc-bg-light dark:bg-odc-bg-dark">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-8">{content}</div>;
}