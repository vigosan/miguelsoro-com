import { forwardRef } from 'react';
import { CheckIcon } from '@heroicons/react/16/solid';
import { cn } from '@/utils/cn';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, id, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex items-start space-x-3">
        <div className="relative flex items-center">
          <input
            id={checkboxId}
            type="checkbox"
            className={cn(
              "peer h-4 w-4 rounded border border-gray-300 text-gray-900 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
              error && "border-red-300 focus:ring-red-500",
              className
            )}
            ref={ref}
            {...props}
          />
          <CheckIcon 
            className="pointer-events-none absolute inset-0 h-4 w-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
            aria-hidden="true"
          />
        </div>
        <div className="flex-1">
          {label && (
            <label 
              htmlFor={checkboxId}
              className="text-sm font-medium text-gray-900 cursor-pointer"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
          {error && (
            <p className="text-sm text-red-600 mt-1">{error}</p>
          )}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };