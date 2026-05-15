import React, { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 placeholder:text-slate-400 text-slate-800 ${
          error
            ? "border-red-500 focus:ring-red-200"
            : "border-slate-300 focus:ring-slate-400"
        } ${className}`}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export { Input };
