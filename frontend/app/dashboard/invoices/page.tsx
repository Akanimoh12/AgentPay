"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { FileText, Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Dialog } from "@/components/ui/Dialog";
import { CopyButton } from "@/components/ui/CopyButton";
import { Tooltip } from "@/components/ui/Tooltip";
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
import { useInvoices, useCreateInvoice } from "@/hooks/useInvoices";

function shortenHash(hash: string) {
	if (!hash) return "";
	return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

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

const statusVariant: Record<string, "outline" | "default" | "success"> = {
	draft: "outline",
	finalized: "default",
	paid: "success",
};

export default function InvoicesPage() {
	const searchParams = useSearchParams();
	const [statusFilter, setStatusFilter] = useState("all");
	const [agentFilter, setAgentFilter] = useState("");
	const [dialogOpen, setDialogOpen] = useState(searchParams.get("action") === "create");
	const [page, setPage] = useState(0);

	const filters: Record<string, string> = {};
	if (statusFilter !== "all") filters.status = statusFilter;
	if (agentFilter) filters.agentId = agentFilter;

	const { data: invoices, isLoading, isError, refetch } = useInvoices(filters);
	const createInvoice = useCreateInvoice();

	const [form, setForm] = useState({
		fromAgentId: "",
		toAgentId: "",
		amount: "",
		description: "",
	});

	const pageSize = 20;
	const paged = invoices?.slice(page * pageSize, (page + 1) * pageSize) || [];
	const totalPages = Math.ceil((invoices?.length || 0) / pageSize);

	const handleCreate = async () => {
		await createInvoice.mutateAsync(form);
		setDialogOpen(false);
		setForm({ fromAgentId: "", toAgentId: "", amount: "", description: "" });
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-text-primary">Invoices</h1>
					<p className="mt-1 text-sm text-text-secondary">
						Billing records stored on 0G Storage
					</p>
				</div>
				<Button onClick={() => setDialogOpen(true)}>
					<Plus className="h-4 w-4" />
					Create Invoice
				</Button>
			</div>

			<div className="flex flex-wrap items-center gap-3">
				<Select
					options={[
						{ value: "all", label: "All Statuses" },
						{ value: "draft", label: "Draft" },
						{ value: "finalized", label: "Finalized" },
						{ value: "paid", label: "Paid" },
					]}
					value={statusFilter}
					onChange={(e) => {
						setStatusFilter(e.target.value);
						setPage(0);
					}}
				/>
				<Input
					placeholder="Filter by agent ID..."
					value={agentFilter}
					onChange={(e) => {
						setAgentFilter(e.target.value);
						setPage(0);
					}}
					className="w-64"
				/>
			</div>

			<Card>
				{isLoading ? (
					<div className="space-y-3">
						{Array.from({ length: 5 }).map((_, i) => (
							<Skeleton key={i} className="h-12 w-full" />
						))}
					</div>
				) : isError ? (
					<div className="flex flex-col items-center py-8">
						<p className="text-sm text-danger mb-3">Failed to load invoices</p>
						<Button variant="outline" size="sm" onClick={() => refetch()}>
							Retry
						</Button>
					</div>
				) : !invoices?.length ? (
					<EmptyState
						icon={FileText}
						message="No invoices found. Create your first invoice."
						actionLabel="Create Invoice"
						onAction={() => setDialogOpen(true)}
					/>
				) : (
					<>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Invoice ID</TableHead>
									<TableHead>From</TableHead>
									<TableHead>To</TableHead>
									<TableHead>Amount</TableHead>
									<TableHead>Description</TableHead>
									<TableHead>Storage Key</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Date</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{paged.map((inv: any) => (
									<TableRow
										key={inv.id || inv.invoiceId}
										className="cursor-pointer"
										onClick={() =>
											(window.location.href = `/dashboard/invoices/${inv.invoiceId}`)
										}
									>
										<TableCell>
											<div className="flex items-center gap-1">
												<span className="font-mono text-xs">
													{shortenHash(inv.invoiceId || "")}
												</span>
												<CopyButton text={inv.invoiceId || ""} />
											</div>
										</TableCell>
										<TableCell>
											<span className="text-sm">
												{inv.fromAgentName || shortenHash(inv.fromAgentId || "")}
											</span>
										</TableCell>
										<TableCell>
											<span className="text-sm">
												{inv.toAgentName || shortenHash(inv.toAgentId || "")}
											</span>
										</TableCell>
										<TableCell>
											<span className="font-mono">{inv.amount} A0GI</span>
										</TableCell>
										<TableCell>
											<Tooltip content={inv.description || ""}>
												<span className="block max-w-[160px] truncate text-sm text-text-secondary">
													{inv.description || "—"}
												</span>
											</Tooltip>
										</TableCell>
										<TableCell>
											{inv.storageKey ? (
												<div className="flex items-center gap-1">
													<span className="font-mono text-xs text-accent">
														{shortenHash(inv.storageKey)}
													</span>
													<CopyButton text={inv.storageKey} />
													<a
														href={`https://scan-testnet.0g.ai/storage/${inv.storageKey}`}
														target="_blank"
														rel="noopener noreferrer"
														onClick={(e) => e.stopPropagation()}
														aria-label="View on 0G Storage"
													>
														<ExternalLink className="h-3.5 w-3.5 text-text-tertiary hover:text-primary" />
													</a>
												</div>
											) : (
												<span className="text-text-tertiary">—</span>
											)}
										</TableCell>
										<TableCell>
											<Badge
												variant={statusVariant[inv.status] || "outline"}
											>
												{inv.status?.charAt(0).toUpperCase() +
													inv.status?.slice(1)}
											</Badge>
										</TableCell>
										<TableCell>
											<Tooltip
												content={new Date(inv.createdAt).toLocaleString()}
											>
												<span className="text-sm text-text-secondary">
													{formatRelativeTime(inv.createdAt)}
												</span>
											</Tooltip>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
						{totalPages > 1 && (
							<div className="flex items-center justify-between border-t border-border pt-4 mt-4">
								<span className="text-sm text-text-tertiary">
									Page {page + 1} of {totalPages}
								</span>
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										disabled={page === 0}
										onClick={() => setPage((p) => p - 1)}
									>
										Previous
									</Button>
									<Button
										variant="outline"
										size="sm"
										disabled={page >= totalPages - 1}
										onClick={() => setPage((p) => p + 1)}
									>
										Next
									</Button>
								</div>
							</div>
						)}
					</>
				)}
			</Card>

			<Dialog
				open={dialogOpen}
				onClose={() => setDialogOpen(false)}
				title="Create Invoice"
				footer={
					<div className="flex justify-end gap-3">
						<Button variant="outline" onClick={() => setDialogOpen(false)}>
							Cancel
						</Button>
						<Button
							loading={createInvoice.isPending}
							onClick={handleCreate}
							disabled={!form.fromAgentId || !form.toAgentId || !form.amount}
						>
							Create Invoice
						</Button>
					</div>
				}
			>
				<div className="space-y-4">
					<Input
						label="From Agent ID"
						placeholder="0x..."
						value={form.fromAgentId}
						onChange={(e) => setForm((f) => ({ ...f, fromAgentId: e.target.value }))}
					/>
					<Input
						label="To Agent ID"
						placeholder="0x..."
						value={form.toAgentId}
						onChange={(e) => setForm((f) => ({ ...f, toAgentId: e.target.value }))}
					/>
					<Input
						label="Amount"
						type="number"
						placeholder="0.00"
						value={form.amount}
						onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
					/>
					<div className="space-y-1.5">
						<label className="block text-sm font-medium text-text-secondary">
							Description
						</label>
						<textarea
							className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-border-focus min-h-[80px] resize-y"
							placeholder="Invoice description..."
							value={form.description}
							onChange={(e) =>
								setForm((f) => ({ ...f, description: e.target.value }))
							}
						/>
					</div>
				</div>
			</Dialog>
		</div>
	);
}
