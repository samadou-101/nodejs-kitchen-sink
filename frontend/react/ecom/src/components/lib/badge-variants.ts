import { cva } from "class-variance-authority"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        amber: "border-transparent bg-amber-100 text-amber-800",
        emerald: "border-transparent bg-emerald-100 text-emerald-800",
        blue: "border-transparent bg-blue-100 text-blue-800",
        green: "border-transparent bg-green-100 text-green-800",
        red: "border-transparent bg-red-100 text-red-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export { badgeVariants }
