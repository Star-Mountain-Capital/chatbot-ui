import * as React from 'react';

import { Button } from './button';

import { cn } from '@/lib/utils';

function Alert({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(
        'bg-destructive/20 dark:bg-destructive/40 border-destructive/20 dark:border-destructive/40 flex w-full rounded-lg border px-4 py-3 text-sm',
        className
      )}
      {...props}
    />
  );
}

function AlertContainer({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'grid flex-1 grid-cols-[0_1fr] gap-y-1 has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
        className
      )}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn('col-start-2 line-clamp-1 font-medium', className)}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'text-foreground col-start-2 grid justify-items-start gap-1 [&_p]:leading-relaxed',
        className
      )}
      {...props}
    />
  );
}

function AlertButton({ children }: React.ComponentProps<typeof Button>) {
  return (
    <Button
      className="self-center"
      size="sm"
    >
      {children}
    </Button>
  );
}

export { Alert, AlertButton, AlertContainer, AlertTitle, AlertDescription };
