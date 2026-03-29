"use client";

import type { InputHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leadingIcon?: ReactNode;
}

export const Input = ({ leadingIcon, className, ...props }: InputProps) => {
  if (leadingIcon) {
    return (
      <div className="flex items-center gap-2 bg-white border border-stone-300 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent transition">
        <span className="text-stone-400 flex-shrink-0">{leadingIcon}</span>
        <input
          className={cn("flex-1 text-sm outline-none bg-transparent", className)}
          {...props}
        />
      </div>
    );
  }

  return (
    <input
      className={cn(
        "w-full px-3 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition",
        className
      )}
      {...props}
    />
  );
}
