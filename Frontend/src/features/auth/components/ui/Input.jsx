import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Input = forwardRef(({ className, type, error, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-md border border-border bg-black/50 px-4 py-2 text-sm text-text-primary ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300",
          error && "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500",
          className
        )}
        ref={ref}
        {...props}
      />
      {error && <span className="text-xs text-red-500 mt-1">{error.message || error}</span>}
    </div>
  );
});

Input.displayName = "Input";

export { Input };
