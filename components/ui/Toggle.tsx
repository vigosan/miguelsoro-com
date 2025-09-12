import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
}

const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ className, label, description, error, id, ...props }, ref) => {
    const toggleId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex items-center justify-between">
        <span className="flex grow flex-col">
          {label && (
            <label 
              id={`${toggleId}-label`}
              htmlFor={toggleId}
              className="text-sm/6 font-medium text-gray-900 cursor-pointer"
            >
              {label}
            </label>
          )}
          {description && (
            <span 
              id={`${toggleId}-description`}
              className="text-sm text-gray-500"
            >
              {description}
            </span>
          )}
          {error && (
            <span className="text-sm text-red-600 mt-1">{error}</span>
          )}
        </span>
        <div className={cn(
          "group relative inline-flex w-11 shrink-0 rounded-full bg-gray-200 p-0.5 transition-colors duration-200 ease-in-out has-checked:bg-gray-900",
          className
        )}>
          <span className="size-5 rounded-full bg-white transition-transform duration-200 ease-in-out group-has-checked:translate-x-5 border-0" />
          <input
            id={toggleId}
            type="checkbox"
            aria-labelledby={label ? `${toggleId}-label` : undefined}
            aria-describedby={description ? `${toggleId}-description` : undefined}
            className="absolute inset-0 appearance-none focus:outline-hidden"
            ref={ref}
            {...props}
          />
        </div>
      </div>
    );
  }
);

Toggle.displayName = "Toggle";

export { Toggle };