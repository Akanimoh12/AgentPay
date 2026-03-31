import { Skeleton } from "@/components/ui/Skeleton";

export default function EscrowsLoading() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<Skeleton className="h-10 w-40" />
				<Skeleton className="h-10 w-36" />
			</div>
			<div className="flex gap-3">
				<Skeleton className="h-10 w-32" />
				<Skeleton className="h-10 w-64" />
			</div>
			<Skeleton className="h-[500px] w-full" />
		</div>
	);
}
