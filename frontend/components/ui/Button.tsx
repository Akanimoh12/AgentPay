"use client";

import { forwardRef } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Loader2 } from "lucide-react";

const variantStyles = {
	primary: "bg-primary text-white hover:bg-primary-dark shadow-sm",
	secondary: "bg-white text-text-primary border border-border hover:border-primary/50 shadow-sm",
	outline: "bg-transparent text-text-primary border border-border hover:bg-bg-elevated",
	danger: "bg-danger text-white hover:bg-danger/90 shadow-sm",
	ghost: "bg-transparent text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
};

const sizeStyles = {
	sm: "px-3 py-1.5 text-xs",
	md: "px-4 py-2 text-sm",
	lg: "px-6 py-3 text-base",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: keyof typeof variantStyles;
	size?: keyof typeof sizeStyles;
	loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
		return (
			<button
				ref={ref}
				disabled={disabled || loading}
				className={twMerge(
					clsx(
						"inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none",
						variantStyles[variant],
						sizeStyles[size],
						className,
					),
				)}
				{...props}
			>
				{loading && <Loader2 className="h-4 w-4 animate-spin" />}
				{children}
			</button>
		);
	},
);

Button.displayName = "Button";
