import React, { forwardRef } from 'react';
import { cn } from './Input';
import { Loader2 } from 'lucide-react';

const Button = forwardRef(({ className, variant = 'default', size = 'default', isLoading, children, disabled, ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    default: "bg-primary text-black hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:scale-[1.02] active:scale-95",
    outline: "border border-border bg-transparent hover:bg-surface text-text-primary",
    ghost: "hover:bg-surface text-text-primary",
    link: "text-primary underline-offset-4 hover:underline",
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 text-xs",
    lg: "h-12 px-8 text-base",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      ref={ref}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
});

Button.displayName = "Button";

export { Button };
