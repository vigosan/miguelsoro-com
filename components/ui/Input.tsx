import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  'data-testid'?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, 'data-testid': testId, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const defaultTestId = testId || (inputId ? `input-${inputId}` : undefined);

    return (
      <div>
        {label && (
          <label 
            htmlFor={inputId} 
            className="block text-sm/6 font-medium text-gray-900 mb-2"
            data-testid={defaultTestId ? `${defaultTestId}-label` : undefined}
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          className={cn(
            "block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6",
            error && "outline-red-300 focus:outline-red-600",
            className
          )}
          data-testid={defaultTestId}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600" data-testid={defaultTestId ? `${defaultTestId}-error` : undefined}>{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };