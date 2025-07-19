
import React from 'react';
import { useController, Control, FieldError, FieldValues, UseFormStateReturn } from 'react-hook-form';
import { Label } from './label';

// Form (simple form wrapper)
export const Form = React.forwardRef<HTMLFormElement, React.FormHTMLAttributes<HTMLFormElement>>(
    ({ children, ...props }, ref) => {
        return <form ref={ref} {...props}>{children}</form>;
    }
);
Form.displayName = 'Form';


// FormField (Controller for react-hook-form)
interface FormFieldProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: keyof TFieldValues;
  render: (params: {
    field: {
      onChange: (...event: any[]) => void;
      onBlur: () => void;
      value: any;
      name: string;
      ref: React.Ref<any>;
    };
    fieldState: {
      invalid: boolean;
      isTouched: boolean;
      isDirty: boolean;
      error?: FieldError;
    };
    formState: UseFormStateReturn<TFieldValues>;
  }) => React.ReactElement;
}

export function FormField<TFieldValues extends FieldValues = FieldValues>({ control, name, render }: FormFieldProps<TFieldValues>) {
  const { field, fieldState, formState } = useController({ 
    name: name as any, 
    control 
  });
  return render({ field, fieldState, formState });
}

// FormItem (simple div wrapper)
export const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        return <div ref={ref} className={`space-y-1 ${className || ''}`} {...props} />;
    }
);
FormItem.displayName = 'FormItem';


// FormLabel (uses the Label component)
export const FormLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => {
  // TODO: Add specific styling if needed, e.g., from useFormField for error states
  return <Label ref={ref} className={className} {...props} />;
});
FormLabel.displayName = 'FormLabel';


// FormControl (simple div wrapper or React.Fragment)
export const FormControl = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ ...props }, ref) => {
        return <div ref={ref} {...props} />;
    }
);
FormControl.displayName = 'FormControl';

// FormMessage
export const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & { error?: FieldError }
>(({ className, children, error, ...props }, ref) => {
  const body = error ? String(error?.message) : children;

  if (!body) {
    return null;
  }
  return (
    <p
      ref={ref}
      className={`text-xs font-medium text-red-600 ${className || ''}`}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = 'FormMessage';