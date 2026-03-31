import { Skeleton } from "@/components/ui/Skeleton";

export default function OracleLoading() {
	return (
		<div className="space-y-6">
			<Skeleton className="h-10 w-48" />
			<Skeleton className="h-56 w-full" />
			<Skeleton className="h-[400px] w-full" />
		</div>
	);
}
