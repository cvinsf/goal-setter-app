import React from 'react';
import { cn, getProgressColor, getProgressTextColor } from '../../utils';

export interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  className?: string;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'md',
  showLabel = true,
  label,
  className,
  animated = true,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const roundedPercentage = Math.round(percentage);

  const sizes = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className={cn('w-full', className)}>
      {(label || showLabel) && (
        <div className="flex items-center justify-between mb-2">
          {label && <span className="text-sm font-medium text-primary-900">{label}</span>}
          {showLabel && (
            <span className={cn('text-sm font-semibold', getProgressTextColor(percentage))}>
              {roundedPercentage}%
            </span>
          )}
        </div>
      )}
      <div className={cn('w-full bg-primary-100 rounded-full overflow-hidden', sizes[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300 ease-out',
            getProgressColor(percentage),
            animated && 'animate-pulse-subtle'
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={roundedPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};
