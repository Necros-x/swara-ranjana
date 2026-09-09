"use client";

import * as React from "react"
import { cn } from "@/admin-site/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2271B1] disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-[#2271B1] text-white shadow hover:bg-[#2271B1]/90": variant === 'default',
            "border border-[#C2CBD2]/30 bg-white shadow-sm hover:bg-gray-50 hover:text-[#31465A] text-[#7D8A95]": variant === 'outline',
            "hover:bg-gray-100 hover:text-[#31465A] text-[#7D8A95]": variant === 'ghost',
            "bg-red-500 text-white shadow-sm hover:bg-red-500/90": variant === 'destructive',
            "h-10 px-4 py-2": size === 'default',
            "h-8 rounded-md px-3 text-[10px]": size === 'sm',
            "h-12 rounded-md px-8 text-xs": size === 'lg',
            "h-10 w-10": size === 'icon',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
