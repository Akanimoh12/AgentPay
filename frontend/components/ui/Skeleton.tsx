import { clsx } from "clsx";

interface SkeletonProps {
	className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
	return (
		<div
			className={clsx(
				"animate-pulse rounded-lg bg-gray-100",
				className,
			)}
		/>
	);
}
