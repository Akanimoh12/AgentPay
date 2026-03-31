import { clsx } from "clsx";

const variantStyles = {
	default: "bg-primary/20 text-primary",
	success: "bg-success/20 text-success",
	warning: "bg-warning/20 text-warning",
	danger: "bg-danger/20 text-danger",
	outline: "bg-transparent border border-border text-text-secondary",
};

interface BadgeProps {
	variant?: keyof typeof variantStyles;
	children: React.ReactNode;
	className?: string;
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
	return (
		<span
			className={clsx(
				"inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
				variantStyles[variant],
				className,
			)}
		>
			{children}
		</span>
	);
}
