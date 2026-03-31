import { clsx } from "clsx";

const variantStyles = {
	online: "bg-success",
	offline: "bg-danger",
	pending: "bg-warning",
};

interface StatusDotProps {
	variant?: keyof typeof variantStyles;
	className?: string;
}

export function StatusDot({ variant = "online", className }: StatusDotProps) {
	return (
		<span
			className={clsx("inline-block h-2 w-2 rounded-full", variantStyles[variant], className)}
		/>
	);
}
