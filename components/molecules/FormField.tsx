"use client";

import type { InputHTMLAttributes } from "react";

import { Input } from "@/components/atoms/Input";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const FormField = ({ label, id, ...props }: FormFieldProps) => {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-stone-700 mb-1.5"
      >
        {label}
      </label>
      <Input id={fieldId} {...props} />
    </div>
  );
}
