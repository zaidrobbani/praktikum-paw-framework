"use client";
import React from "react";
import { Control, FieldValues, Path, useController } from "react-hook-form";
import { Input, InputProps } from "./Input";

export interface FormInputProps<T extends FieldValues> extends Omit<
  InputProps,
  "id" | "name" | "value"
> {
  id: string;
  label: string;
  control: Control<T>;
  name: Path<T>;
  required?: boolean;
}

const FormInput = <T extends FieldValues>({
  id,
  label,
  name,
  control,
  required = false,
  className = "",
  ...props
}: FormInputProps<T>) => {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  return (
    <div className="w-full">
      <label htmlFor={id} className="block font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Input
        id={id}
        {...field}
        error={!!error}
        required={required}
        className={className}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-sm font-medium mt-1.5">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default FormInput;
