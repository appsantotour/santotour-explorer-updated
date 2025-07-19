import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    const baseStyle = "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70";
    return (
      <label
        ref={ref}
        className={`${baseStyle} ${className || ''}`}
        {...props}
      />
    );
  }
);
Label.displayName = 'Label';