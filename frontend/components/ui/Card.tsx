import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface CardProps {
	title?: string;
	description?: string;
	children: React.ReactNode;
	className?: string;
}

export function Card({ title, description, children, className }: CardProps) {
	return (
		<div
			className={twMerge(
				clsx(
					"bg-white border border-border rounded-2xl shadow-card",
					className,
				),
			)}
		>
			{(title || description) && (
				<div className="px-6 py-4 border-b border-border">
					{title && <h3 className="text-lg font-semibold text-text-primary">{title}</h3>}
					{description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
				</div>
			)}
			<div className="p-6">{children}</div>
		</div>
	);
}
