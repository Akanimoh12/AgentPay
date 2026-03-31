import { Skeleton } from "@/components/ui/Skeleton";

export default function AgentsLoading() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<Skeleton className="h-10 w-40" />
				<Skeleton className="h-10 w-36" />
			</div>
			<div className="flex gap-3">
				<Skeleton className="h-10 w-64" />
				<Skeleton className="h-10 w-32" />
				<Skeleton className="h-10 w-32" />
			</div>
			<Skeleton className="h-96 w-full" />
		</div>
	);
}
