import * as React from "react"

import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost' | 'gradient' | 'icon';
    size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg';
    loading?: boolean;
    loadingText?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, children, disabled, loading = false, loadingText, variant = 'default', size = 'default', ...props }, ref) => {
        const isIconButton = size === "icon" || size === "icon-sm" || size === "icon-lg"
        const content = loading
            ? (
                <>
                    <Spinner size={isIconButton ? "sm" : "sm"} className={cn(!isIconButton && "text-current")} />
                    {!isIconButton ? (loadingText ?? children) : <span className="sr-only">로딩 중</span>}
                </>
            )
            : children

        return (
            <button
                className={cn(
                    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-transparent text-sm font-medium ring-offset-background transition-[background-color,border-color,color,box-shadow,transform,opacity] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bon-green-start/60 focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:translate-y-0 disabled:shadow-none disabled:opacity-100 [&_svg]:shrink-0",
                    {
                        "bg-slate-900 text-white shadow-[0_14px_30px_-20px_rgba(15,23,42,0.9)] hover:bg-slate-800": variant === 'default',
                        "border-slate-200 bg-white text-slate-700 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.45)] hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950": variant === 'outline',
                        "border-transparent bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-950": variant === 'ghost',
                        "bg-gradient-to-r from-bon-green-start via-[#76b733] to-bon-green-end text-white shadow-[0_18px_40px_-22px_rgba(95,162,36,0.9)] hover:brightness-[1.03]": variant === 'gradient',
                        "border-slate-200/80 bg-white/92 text-slate-700 shadow-[0_18px_32px_-24px_rgba(15,23,42,0.55)] backdrop-blur-sm hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950": variant === 'icon',
                        "h-11 px-4 py-2.5": size === 'default',
                        "h-10 rounded-xl px-3.5": size === 'sm',
                        "h-12 rounded-2xl px-8": size === 'lg',
                        "h-11 w-11 rounded-2xl p-0 [&_svg]:size-5": size === 'icon',
                        "h-9 w-9 rounded-xl p-0 [&_svg]:size-4": size === 'icon-sm',
                        "h-12 w-12 rounded-[1.15rem] p-0 [&_svg]:size-5": size === 'icon-lg',
                        "border-slate-200 bg-slate-100 text-slate-400": disabled || loading,
                        "bg-slate-200 text-slate-500": (disabled || loading) && variant === "gradient",
                        "bg-slate-100/90 text-slate-400": (disabled || loading) && variant === "icon",
                        "pl-3.5 pr-4": loading && !isIconButton
                    },
                    className
                )}
                ref={ref}
                disabled={disabled || loading}
                {...props}
            >
                {content}
            </button>
        )
    }
)
Button.displayName = "Button"

export { Button }
