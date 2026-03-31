"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { CopyButton } from "@/components/ui/CopyButton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
} from "@/components/ui/Table";
import { useAgent } from "@/hooks/useAgents";
import { useRecentPayments } from "@/hooks/useRecentPayments";

function shortenId(id: string) {
	if (!id) return "—";
	return id.length > 14 ? `${id.slice(0, 8)}...${id.slice(-4)}` : id;
}

export default function AgentDetailPage({
	params,
}: {
	params: Promise<{ agentId: string }>;
}) {
	const { agentId } = use(params);
	const { data: agent, isLoading } = useAgent(agentId);
	const { payments } = useRecentPayments();

	const agentPayments = (payments || []).filter(
		(p: any) => p.fromAgentId === agentId || p.toAgentId === agentId,
	);

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-48 w-full" />
			</div>
		);
	}

	if (!agent) {
		return (
			<EmptyState message="Agent not found." actionLabel="Back to Agents" onAction={() => window.history.back()} />
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<Link
					href="/dashboard/agents"
					className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition-colors mb-4"
				>
					<ArrowLeft className="h-4 w-4" /> Back to Agents
				</Link>
				<div className="flex items-center gap-3">
					<h1 className="text-2xl font-bold text-text-primary">
						{agent.name}
					</h1>
					<Badge variant={agent.active ? "success" : "outline"}>
						{agent.active ? "Active" : "Inactive"}
					</Badge>
				</div>
			</div>

			<Card title="Information">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<p className="text-xs text-text-tertiary">Agent ID</p>
						<div className="flex items-center gap-1 font-mono text-sm text-text-primary">
							{shortenId(agent.agentId)}
							<CopyButton text={agent.agentId} />
						</div>
					</div>
					<div>
						<p className="text-xs text-text-tertiary">Wallet Address</p>
						<div className="flex items-center gap-1 font-mono text-sm text-text-primary">
							{shortenId(agent.wallet)}
							<CopyButton text={agent.wallet} />
						</div>
					</div>
					<div>
						<p className="text-xs text-text-tertiary">Name</p>
						<p className="text-sm text-text-primary">{agent.name}</p>
					</div>
					<div>
						<p className="text-xs text-text-tertiary">Status</p>
						<p className="text-sm text-text-primary">
							{agent.active ? "Active" : "Inactive"}
						</p>
					</div>
					<div>
						<p className="text-xs text-text-tertiary">Registered</p>
						<p className="text-sm text-text-primary">
							{agent.registeredAt
								? new Date(agent.registeredAt).toLocaleString()
								: "—"}
						</p>
					</div>
				</div>
			</Card>

			<Card title="Services">
				{(agent.services || []).length === 0 ? (
					<p className="text-sm text-text-secondary">No services listed.</p>
				) : (
					<div className="flex flex-wrap gap-2">
						{agent.services.map((s: string) => (
							<Badge key={s} variant="default">
								{s}
							</Badge>
						))}
					</div>
				)}
			</Card>

			<Card title="Payment History">
				{agentPayments.length === 0 ? (
					<EmptyState message="No payments for this agent." />
				) : (
					<>
						<Table>
							<TableHeader>
								<tr>
									<TableHead>Type</TableHead>
									<TableHead>From</TableHead>
									<TableHead>To</TableHead>
									<TableHead>Amount</TableHead>
									<TableHead>Status</TableHead>
								</tr>
							</TableHeader>
							<TableBody>
								{agentPayments.slice(0, 10).map((p: any, i: number) => (
									<TableRow key={p.id || i}>
										<TableCell>
											<Badge
												variant={
													p.type === "escrow"
														? "success"
														: "default"
												}
											>
												{p.type === "escrow" ? "Escrow" : "Direct"}
											</Badge>
										</TableCell>
										<TableCell>{shortenId(p.fromAgentId)}</TableCell>
										<TableCell>{shortenId(p.toAgentId)}</TableCell>
										<TableCell>{p.amount} A0GI</TableCell>
										<TableCell>
											<Badge
												variant={
													p.status === "completed" || p.status === "released"
														? "success"
														: p.status === "active"
															? "warning"
															: "danger"
												}
											>
												{p.status}
											</Badge>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
						<div className="mt-4 text-right">
							<Link
								href={`/dashboard/payments?agentId=${agentId}`}
								className="text-sm text-primary hover:underline"
							>
								View All →
							</Link>
						</div>
					</>
				)}
			</Card>
		</div>
	);
}
