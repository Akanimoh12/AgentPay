import { LucideIcon, Inbox } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
	icon?: LucideIcon;
	message: string;
	actionLabel?: string;
	onAction?: () => void;
}

export function EmptyState({
	icon: Icon = Inbox,
	message,
	actionLabel,
	onAction,
}: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center justify-center py-12 text-center">
			<Icon className="h-12 w-12 text-text-tertiary mb-4" />
			<p className="text-sm text-text-secondary mb-4">{message}</p>
			{actionLabel && onAction && (
				<Button variant="primary" size="sm" onClick={onAction}>
					{actionLabel}
				</Button>
			)}
		</div>
	);
}
