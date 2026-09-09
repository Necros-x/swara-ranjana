"use client";

import * as React from "react"
import { cn } from "@/admin-site/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'secondary';
  className?: string;
  children?: React.ReactNode;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors focus:outline-none",
        {
          "border-transparent bg-[#2271B1] text-white": variant === 'default',
          "border-transparent bg-green-100 text-green-700": variant === 'success',
          "border-transparent bg-yellow-100 text-yellow-700": variant === 'warning',
          "border-transparent bg-red-100 text-red-700": variant === 'destructive',
          "border-transparent bg-gray-100 text-[#7D8A95]": variant === 'secondary',
          "border-[#C2CBD2]/50 text-[#31465A] bg-white": variant === 'outline',
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
