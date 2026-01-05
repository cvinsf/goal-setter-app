import React from 'react';
import { cn } from '../../utils';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-');

    const checkbox = (
      <input
        ref={ref}
        type="checkbox"
        id={checkboxId}
        className={cn(
          'h-5 w-5 rounded border-primary-300 text-primary-700',
          'focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'cursor-pointer transition-colors',
          error && 'border-danger',
          className
        )}
        {...props}
      />
    );

    if (!label) {
      return checkbox;
    }

    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          {checkbox}
          <label
            htmlFor={checkboxId}
            className="text-sm font-medium text-primary-900 cursor-pointer select-none"
          >
            {label}
          </label>
        </div>
        {error && <p className="ml-7 text-sm text-danger">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
