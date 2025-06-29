'use client';

import { cn } from '@/utils/utils';
import { useControllableState } from '@radix-ui/react-use-controllable-state';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDownIcon } from 'lucide-react';
import { createContext, memo, useContext, useEffect, useState } from 'react';
import type { ComponentProps } from 'react';
import { AIResponse } from './response';

type AIReasoningContextValue = {
  isStreaming: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  duration: number;
};

const AIReasoningContext = createContext<AIReasoningContextValue | null>(null);

const useAIReasoning = () => {
  const context = useContext(AIReasoningContext);
  if (!context) {
    throw new Error('AIReasoning components must be used within AIReasoning');
  }
  return context;
};

export type AIReasoningProps = ComponentProps<typeof Collapsible> & {
  isStreaming?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  duration?: number;
};

export const AIReasoning = memo(
  ({
    className,
    isStreaming = false,
    open,
    defaultOpen = false,
    onOpenChange,
    duration: durationProp,
    children,
    ...props
  }: AIReasoningProps) => {
    const [isOpen, setIsOpen] = useControllableState({
      prop: open,
      defaultProp: defaultOpen,
      onChange: onOpenChange,
    });
    const [duration, setDuration] = useControllableState({
      prop: durationProp,
      defaultProp: 0,
    });

    const [hasAutoClosedRef, setHasAutoClosedRef] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);

    // Track duration when streaming starts and ends
    useEffect(() => {
      if (isStreaming) {
        if (startTime === null) {
          setStartTime(Date.now());
        }
      } else if (startTime !== null) {
        setDuration(Math.round((Date.now() - startTime) / 1000));
        setStartTime(null);
      }
    }, [isStreaming, startTime, setDuration]);

    // Auto-open when streaming starts, auto-close when streaming ends (once only)
    useEffect(() => {
      if (isStreaming && !isOpen) {
        setIsOpen(true);
      } else if (!isStreaming && isOpen && !defaultOpen && !hasAutoClosedRef) {
        // Add a small delay before closing to allow user to see the content
        const timer = setTimeout(() => {
          setIsOpen(false);
          setHasAutoClosedRef(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }, [isStreaming, isOpen, defaultOpen, setIsOpen, hasAutoClosedRef]);

    const handleOpenChange = (open: boolean) => {
      setIsOpen(open);
    };

    return (
      <AIReasoningContext.Provider
        value={{ isStreaming, isOpen, setIsOpen, duration }}
      >
        <Collapsible
          open={isOpen}
          onOpenChange={handleOpenChange}
          className={cn('not-prose', className)}
          {...props}
        >
          {children}
        </Collapsible>
      </AIReasoningContext.Provider>
    );
  }
);

export type AIReasoningTriggerProps = ComponentProps<
  typeof CollapsibleTrigger
> & {
  title?: string;
};

export const AIReasoningTrigger = memo(
  ({
    className,
    title = 'Raciocínio',
    children,
    ...props
  }: AIReasoningTriggerProps) => {
    const { isStreaming, isOpen, duration } = useAIReasoning();

    return (
      <CollapsibleTrigger
        className={cn(
          'flex items-center gap-2 text-muted-foreground text-xs',
          className
        )}
        {...props}
      >
        {children ?? (
          <>
            {isStreaming ? (
              <p className="animate-pulse">Pensando...</p>
            ) : (
              <p>
                {duration > 0
                  ? `Pensamento de ${duration} segundos`
                  : 'Raciocínio'
                }
              </p>
            )}
            <ChevronDownIcon
              className={cn(
                'size-4 text-muted-foreground transition-transform',
                isOpen ? 'rotate-180' : 'rotate-0'
              )}
            />
          </>
        )}
      </CollapsibleTrigger>
    );
  }
);

export type AIReasoningContentProps = ComponentProps<
  typeof CollapsibleContent
> & {
  children: string;
};

export const AIReasoningContent = memo(
  ({ className, children, ...props }: AIReasoningContentProps) => (
    <CollapsibleContent
      className={cn('my-1 text-muted-foreground text-sm max-md:max-w-[95%] md:max-w-[80%] lg:max-w-[60%]', className)}
      {...props}
    >
      <AIResponse className="grid gap-2">{children}</AIResponse>
    </CollapsibleContent>
  )
);

AIReasoning.displayName = 'AIReasoning';
AIReasoningTrigger.displayName = 'AIReasoningTrigger';
AIReasoningContent.displayName = 'AIReasoningContent';
