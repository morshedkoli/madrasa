import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#1B6B3A] text-white shadow",
        secondary: "border-transparent bg-[#C9A84C]/20 text-[#C9A84C]",
        destructive: "border-transparent bg-red-500/20 text-red-600",
        outline: "text-gray-600",
        success: "border-transparent bg-green-100 text-[#1B6B3A]",
        warning: "border-transparent bg-yellow-100 text-yellow-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
