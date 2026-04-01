import { LoaderCircle } from "lucide-react"

import { cn } from "@/lib/utils"

type SpinnerProps = {
    className?: string
    size?: "sm" | "md" | "lg"
}

const sizeClasses: Record<NonNullable<SpinnerProps["size"]>, string> = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
}

export function Spinner({ className, size = "md" }: SpinnerProps) {
    return (
        <LoaderCircle
            className={cn("animate-spin text-current", sizeClasses[size], className)}
            aria-hidden="true"
        />
    )
}
