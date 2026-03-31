"use client";

import { useState } from "react";
import { TrendingUp, Search, Gauge } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
} from "@/components/ui/Table";
import { useOraclePrice, useOraclePriceHistory } from "@/hooks/useOracle";

function formatRelativeTime(dateStr: string) {
	const now = Date.now();
	const date = new Date(dateStr).getTime();
	const diff = now - date;
	const minutes = Math.floor(diff / 60000);
	if (minutes < 1) return "just now";
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	return `${days}d ago`;
}

export default function OraclePage() {
	const [serviceType, setServiceType] = useState("text-completion");
	const [params, setParams] = useState("");
	const [historyFilter, setHistoryFilter] = useState("");

	const oraclePrice = useOraclePrice();
	const {
		data: history,
		isLoading: historyLoading,
		isError: historyError,
		refetch: refetchHistory,
	} = useOraclePriceHistory(historyFilter || undefined);

	const handleQuery = () => {
		let parsedParams: Record<string, unknown> | undefined;
		if (params.trim()) {
			try {
				parsedParams = JSON.parse(params);
			} catch {
				parsedParams = { raw: params };
			}
		}
		oraclePrice.mutate({ serviceType, params: parsedParams });
	};

	const result = oraclePrice.data;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-text-primary">Pricing Oracle</h1>
				<p className="mt-1 text-sm text-text-secondary">
					AI-powered fair market pricing via 0G Compute
				</p>
			</div>

			<Card title="Price Query">
				<div className="space-y-4">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<Select
							label="Service Type"
							options={[
								{ value: "text-completion", label: "Text Completion" },
								{ value: "image-generation", label: "Image Generation" },
								{ value: "data-query", label: "Data Query" },
								{ value: "code-review", label: "Code Review" },
								{ value: "custom", label: "Custom" },
							]}
							value={serviceType}
							onChange={(e) => setServiceType(e.target.value)}
						/>
						<div className="space-y-1.5">
							<label className="block text-sm font-medium text-text-secondary">
								Parameters (JSON, optional)
							</label>
							<textarea
								className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-border-focus min-h-[80px] resize-y font-mono"
								placeholder='{"model": "gpt-4", "tokens": 1000}'
								value={params}
								onChange={(e) => setParams(e.target.value)}
							/>
						</div>
					</div>
					<Button
						onClick={handleQuery}
						loading={oraclePrice.isPending}
					>
						<Search className="h-4 w-4" />
						Get Price
					</Button>
				</div>
			</Card>

			{oraclePrice.isError && (
				<div className="rounded-lg border border-danger/30 bg-danger/10 p-4">
					<p className="text-sm text-danger">
						{(oraclePrice.error as Error)?.message || "Failed to fetch price"}
					</p>
				</div>
			)}

			{result && (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<Card className="border-l-4 border-l-text-tertiary">
						<div>
							<p className="text-xs uppercase tracking-wider text-text-tertiary mb-1">
								Floor Price
							</p>
							<p className="text-xl font-semibold text-text-primary">
								{result.floor} A0GI
							</p>
							<p className="text-xs text-text-tertiary mt-1">Minimum recommended</p>
						</div>
					</Card>
					<Card className="border-l-4 border-l-accent">
						<div>
							<p className="text-xs uppercase tracking-wider text-accent mb-1">
								Suggested Price
							</p>
							<p className="text-3xl font-bold text-accent">
								{result.suggested} A0GI
							</p>
							<p className="text-xs text-text-tertiary mt-1">Recommended</p>
						</div>
					</Card>
					<Card className="border-l-4 border-l-text-tertiary">
						<div>
							<p className="text-xs uppercase tracking-wider text-text-tertiary mb-1">
								Ceiling Price
							</p>
							<p className="text-xl font-semibold text-text-primary">
								{result.ceiling} A0GI
							</p>
							<p className="text-xs text-text-tertiary mt-1">Maximum recommended</p>
						</div>
					</Card>
				</div>
			)}

			{result && (
				<Card>
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2">
							<Gauge className="h-4 w-4 text-text-tertiary" />
							<span className="text-sm text-text-secondary">Confidence:</span>
							<div className="flex h-2 w-32 overflow-hidden rounded-full bg-bg-elevated">
								<div
									className="bg-accent transition-all rounded-full"
									style={{
										width: `${(result.confidence || 0.85) * 100}%`,
									}}
								/>
							</div>
							<Badge variant="success">
								{((result.confidence || 0.85) * 100).toFixed(0)}%
							</Badge>
						</div>
						<span className="text-xs text-text-tertiary ml-auto">
							Queried: {result.timestamp ? new Date(result.timestamp).toLocaleString() : new Date().toLocaleString()}
						</span>
					</div>
				</Card>
			)}

			<Card title="Price History">
				<div className="mb-4">
					<Select
						options={[
							{ value: "", label: "All Service Types" },
							{ value: "text-completion", label: "Text Completion" },
							{ value: "image-generation", label: "Image Generation" },
							{ value: "data-query", label: "Data Query" },
							{ value: "code-review", label: "Code Review" },
						]}
						value={historyFilter}
						onChange={(e) => setHistoryFilter(e.target.value)}
					/>
				</div>
				{historyLoading ? (
					<div className="space-y-3">
						{Array.from({ length: 5 }).map((_, i) => (
							<Skeleton key={i} className="h-10 w-full" />
						))}
					</div>
				) : historyError ? (
					<div className="flex flex-col items-center py-8">
						<p className="text-sm text-danger mb-3">Failed to load history</p>
						<Button variant="outline" size="sm" onClick={() => refetchHistory()}>
							Retry
						</Button>
					</div>
				) : !history?.length ? (
					<EmptyState
						icon={TrendingUp}
						message="No oracle queries yet. Run a price query above."
					/>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Service Type</TableHead>
								<TableHead>Floor</TableHead>
								<TableHead>Suggested</TableHead>
								<TableHead>Ceiling</TableHead>
								<TableHead>Queried At</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{history.map((entry: any, i: number) => (
								<TableRow key={entry.id || i}>
									<TableCell>
										<Badge variant="default">{entry.serviceType}</Badge>
									</TableCell>
									<TableCell>
										<span className="font-mono text-sm">
											{entry.floor} A0GI
										</span>
									</TableCell>
									<TableCell>
										<span className="font-mono text-sm font-semibold text-accent">
											{entry.suggested} A0GI
										</span>
									</TableCell>
									<TableCell>
										<span className="font-mono text-sm">
											{entry.ceiling} A0GI
										</span>
									</TableCell>
									<TableCell>
										<span className="text-sm text-text-secondary">
											{formatRelativeTime(entry.queriedAt)}
										</span>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</Card>
		</div>
	);
}
