import { cn } from '@/lib/utils';

interface BrandNameProps {
  variant?: 'default' | 'compact';
  className?: string;
}

/**
 * BrandName - Official NexusCanon Alphabetical Logo
 * 
 * Uses brand typography specifications:
 * - Font: Inter
 * - Weight: Regular (400)
 * - Size: 24px
 * - Line Height: 24px
 * - Letter Spacing: -0.4px
 * 
 * @example
 * <BrandName />
 * <BrandName variant="compact" />
 */
export const BrandName = ({ variant = 'default', className }: BrandNameProps) => {
  return (
    <span
      className={cn(
        'font-brand font-normal text-[24px] leading-[24px] tracking-[-0.4px] text-foreground',
        variant === 'compact' && 'text-lg leading-[18px] tracking-[-0.3px]',
        className
      )}
    >
      NEXUSCANON
    </span>
  );
};
