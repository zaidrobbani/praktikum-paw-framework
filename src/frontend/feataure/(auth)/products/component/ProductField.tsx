"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

export type ProductFieldValues = {
  name: string;
  description: string;
  price: string;
  stock: string;
};

type Props<T extends keyof ProductFieldValues> = {
  label: string;
  name: T;
  form: ProductFieldValues;
  errors: Partial<Record<keyof ProductFieldValues, string>>;
  setForm: React.Dispatch<React.SetStateAction<ProductFieldValues>>;
  type?: string;
  placeholder?: string;
  rows?: number;
};

export function ProductField<T extends keyof ProductFieldValues>({
  label,
  name,
  form,
  errors,
  setForm,
  type = "text",
  placeholder,
  rows,
}: Props<T>) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
      </label>
      {rows ? (
        <textarea
          rows={rows}
          value={form[name]}
          onChange={(e) => setForm((p) => ({ ...p, [name]: e.target.value }))}
          placeholder={placeholder}
          className={`w-full px-4 py-2.5 text-black rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-900/20 transition ${
            errors[name]
              ? "border-red-400 bg-red-50"
              : "border-slate-200 bg-slate-50 focus:bg-white"
          }`}
        />
      ) : (
        <input
          type={type}
          value={form[name]}
          onChange={(e) => setForm((p) => ({ ...p, [name]: e.target.value }))}
          placeholder={placeholder}
          className={`w-full px-4 py-2.5 rounded-xl text-black border text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 transition ${
            errors[name]
              ? "border-red-400 bg-red-50"
              : "border-slate-200 bg-slate-50 focus:bg-white"
          }`}
        />
      )}

      {errors[name] && (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={12} />
          {errors[name]}
        </p>
      )}
    </div>
  );
}
