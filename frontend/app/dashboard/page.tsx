"use client";

import Link from "next/link";
import {
	ArrowLeftRight,
	Lock,
	Bot,
	DollarSign,
	ArrowUpRight,
	Zap,
	Shield,
	Clock,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
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
import { useStats } from "@/hooks/useStats";
import { useRecentPayments } from "@/hooks/useRecentPayments";
import { useActivityFeed } from "@/hooks/useActivityFeed";

function timeAgo(dateString: string) {
	const seconds = Math.floor(
		(Date.now() - new Date(dateString).getTime()) / 1000,
	);
	if (seconds < 60) return `${seconds}s ago`;
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	return `${Math.floor(hours / 24)}d ago`;
}

function shortenId(id: string) {
	if (!id) return "—";
	return id.length > 12 ? `${id.slice(0, 6)}...${id.slice(-4)}` : id;
}

const statCards = [
	{
		key: "totalPayments",
		label: "Total Payments",
		icon: ArrowLeftRight,
		change: "+12% this week",
	},
	{
		key: "activeEscrows",
		label: "Active Escrows",
		icon: Lock,
		change: "+3 this week",
	},
	{
		key: "registeredAgents",
		label: "Registered Agents",
		icon: Bot,
		change: "+5 this week",
	},
	{
		key: "totalVolume",
		label: "Total Volume",
		icon: DollarSign,
		change: "+8% this week",
		suffix: " A0GI",
	},
];

const statusVariant: Record<string, "success" | "warning" | "danger"> = {
	completed: "success",
	released: "success",
	active: "warning",
	pending: "warning",
	cancelled: "danger",
};

const eventIcons: Record<string, any> = {
	agent: Bot,
	direct: Zap,
	escrow: Shield,
};

export default function DashboardPage() {
	const stats = useStats();
	const { payments, isLoading: paymentsLoading } = useRecentPayments();
	const { events, isLoading: eventsLoading } = useActivityFeed();

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{statCards.map((s) => (
					<Card key={s.key} className="relative">
						<div className="flex items-start justify-between">
							<div>
								{stats.isLoading ? (
									<Skeleton className="h-8 w-20 mb-1" />
								) : (
									<p className="text-2xl font-bold text-text-primary">
										{(stats as any)[s.key]}
										{s.suffix || ""}
									</p>
								)}
								<p className="text-sm text-text-secondary">{s.label}</p>
								<p className="mt-1 text-xs text-success">{s.change}</p>
							</div>
							<s.icon className="h-5 w-5 text-primary" />
						</div>
					</Card>
				))}
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
				<div className="lg:col-span-3">
					<Card title="Recent Payments">
						{paymentsLoading ? (
							<div className="space-y-3">
								{Array.from({ length: 5 }).map((_, i) => (
									<Skeleton key={i} className="h-10 w-full" />
								))}
							</div>
						) : payments.length === 0 ? (
							<EmptyState message="No payments yet." />
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
											<TableHead>Date</TableHead>
										</tr>
									</TableHeader>
									<TableBody>
										{payments.slice(0, 10).map((p: any, i: number) => (
											<TableRow key={p.id || i}>
												<TableCell>
													<Badge
														variant={
															p.type === "escrow"
																? "success"
																: "default"
														}
													>
														{p.type === "escrow"
															? "Escrow"
															: "Direct"}
													</Badge>
												</TableCell>
												<TableCell>
													{shortenId(p.fromAgentId)}
												</TableCell>
												<TableCell>
													{shortenId(p.toAgentId)}
												</TableCell>
												<TableCell>{p.amount} A0GI</TableCell>
												<TableCell>
													<Badge
														variant={
															statusVariant[p.status] ||
															"outline"
														}
													>
														{p.status}
													</Badge>
												</TableCell>
												<TableCell>
													{p.createdAt
														? timeAgo(p.createdAt)
														: "—"}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
								<div className="mt-4 text-right">
									<Link
										href="/dashboard/payments"
										className="text-sm text-primary hover:underline"
									>
										View All →
									</Link>
								</div>
							</>
						)}
					</Card>
				</div>

				<div className="lg:col-span-2">
					<Card title="Agent Activity Feed">
						{eventsLoading ? (
							<div className="space-y-3">
								{Array.from({ length: 5 }).map((_, i) => (
									<Skeleton key={i} className="h-8 w-full" />
								))}
							</div>
						) : events.length === 0 ? (
							<EmptyState message="No activity yet." />
						) : (
							<div className="space-y-4">
								{events.map((event) => {
									const Icon =
										eventIcons[event.type] || Clock;
									return (
										<div
											key={event.id}
											className="flex items-start gap-3"
										>
											<div className="mt-0.5 rounded-lg bg-primary-50 p-1.5">
												<Icon className="h-3.5 w-3.5 text-primary" />
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-sm text-text-primary truncate">
													{event.description}
												</p>
												<p className="text-xs text-text-tertiary">
													{timeAgo(event.timestamp)}
												</p>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</Card>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				{[
					{
						title: "Register Agent",
						desc: "Create a new agent identity on 0G Chain",
						href: "/dashboard/agents?action=register",
						icon: Bot,
					},
					{
						title: "Send Payment",
						desc: "Make an instant direct payment to an agent",
						href: "/dashboard/payments?action=new",
						icon: ArrowLeftRight,
					},
					{
						title: "Create Escrow",
						desc: "Lock funds in a conditional escrow contract",
						href: "/dashboard/escrows?action=new",
						icon: Lock,
					},
				].map((action) => (
					<Card key={action.title}>
						<div className="flex flex-col items-start gap-3">
							<action.icon className="h-6 w-6 text-primary" />
							<div>
								<h4 className="font-semibold text-text-primary">
									{action.title}
								</h4>
								<p className="mt-1 text-sm text-text-secondary">
									{action.desc}
								</p>
							</div>
							<Link href={action.href}>
								<Button size="sm">{action.title}</Button>
							</Link>
						</div>
					</Card>
				))}
			</div>
		</div>
	);
}
