import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<Skeleton key={i} className="h-28 w-full" />
				))}
			</div>
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
				<Skeleton className="h-80 w-full lg:col-span-3" />
				<Skeleton className="h-80 w-full lg:col-span-2" />
			</div>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				{Array.from({ length: 3 }).map((_, i) => (
					<Skeleton key={i} className="h-36 w-full" />
				))}
			</div>
		</div>
	);
}
