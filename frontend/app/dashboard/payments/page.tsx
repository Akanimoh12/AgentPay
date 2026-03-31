"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeftRight, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Dialog } from "@/components/ui/Dialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { CopyButton } from "@/components/ui/CopyButton";
import { Tooltip } from "@/components/ui/Tooltip";
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
} from "@/components/ui/Table";
import { usePayments, usePayDirect, useCreateEscrow } from "@/hooks/usePayments";
import { useToast } from "@/components/ui/Toast";

function shortenId(id: string) {
	if (!id) return "—";
	return id.length > 14 ? `${id.slice(0, 8)}...${id.slice(-4)}` : id;
}

function timeAgo(dateString: string) {
	const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
	if (seconds < 60) return `${seconds}s ago`;
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	return `${Math.floor(hours / 24)}d ago`;
}

const statusVariant: Record<string, "success" | "warning" | "danger" | "outline"> = {
	completed: "success",
	released: "success",
	active: "warning",
	pending: "warning",
	cancelled: "danger",
};

export default function PaymentsPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [typeFilter, setTypeFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");
	const [agentFilter, setAgentFilter] = useState(searchParams.get("agentId") || "");
	const [page, setPage] = useState(0);
	const [payDialogOpen, setPayDialogOpen] = useState(false);
	const [escrowDialogOpen, setEscrowDialogOpen] = useState(false);

	const filters: Record<string, string> = {};
	if (typeFilter !== "all") filters.type = typeFilter;
	if (statusFilter !== "all") filters.status = statusFilter;
	if (agentFilter) filters.agentId = agentFilter;

	const { data: payments, isLoading } = usePayments(
		Object.keys(filters).length > 0 ? filters : undefined,
	);
	const payDirect = usePayDirect();
	const createEscrow = useCreateEscrow();
	const { toast } = useToast();

	const [payForm, setPayForm] = useState({
		fromAgentId: "",
		toAgentId: "",
		token: "0x0000000000000000000000000000000000000000",
		amount: "",
	});
	const [escrowForm, setEscrowForm] = useState({
		payerAgentId: "",
		payeeAgentId: "",
		token: "0x0000000000000000000000000000000000000000",
		amount: "",
		jobId: "",
		deadline: "",
	});
	const [formError, setFormError] = useState("");

	useEffect(() => {
		if (searchParams.get("action") === "new") {
			setPayDialogOpen(true);
		}
	}, [searchParams]);

	const pageSize = 20;
	const all = payments || [];
	const paginatedPayments = all.slice(page * pageSize, (page + 1) * pageSize);
	const totalPages = Math.ceil(all.length / pageSize);

	const handlePay = async () => {
		setFormError("");
		if (!payForm.fromAgentId || !payForm.toAgentId || !payForm.amount) {
			setFormError("All fields are required.");
			return;
		}
		try {
			const result = await payDirect.mutateAsync(payForm);
			setPayDialogOpen(false);
			setPayForm({ fromAgentId: "", toAgentId: "", token: "0x0000000000000000000000000000000000000000", amount: "" });
			toast({ type: "success", message: "Payment sent successfully", description: result?.txHash ? `TX: ${result.txHash}` : undefined });
		} catch (e: any) {
			setFormError(e.message || "Payment failed.");
			toast({ type: "error", message: "Payment failed", description: e.message });
		}
	};

	const handleCreateEscrow = async () => {
		setFormError("");
		if (!escrowForm.payerAgentId || !escrowForm.payeeAgentId || !escrowForm.amount) {
			setFormError("Required fields missing.");
			return;
		}
		try {
			const result = await createEscrow.mutateAsync(escrowForm);
			setEscrowDialogOpen(false);
			setEscrowForm({ payerAgentId: "", payeeAgentId: "", token: "0x0000000000000000000000000000000000000000", amount: "", jobId: "", deadline: "" });
			toast({ type: "success", message: "Escrow created successfully", description: result?.txHash ? `TX: ${result.txHash}` : undefined });
		} catch (e: any) {
			setFormError(e.message || "Escrow creation failed.");
			toast({ type: "error", message: "Escrow creation failed", description: e.message });
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold text-text-primary">Payments</h1>
					<p className="text-sm text-text-secondary">
						Track all direct payments and escrow settlements
					</p>
				</div>
				<div className="flex gap-2">
					<Button onClick={() => setPayDialogOpen(true)}>Send Payment</Button>
					<Button variant="outline" onClick={() => setEscrowDialogOpen(true)}>
						Create Escrow
					</Button>
				</div>
			</div>

			<Card>
				<div className="flex flex-col gap-3 sm:flex-row mb-4">
					<Select
						options={[
							{ value: "all", label: "All Types" },
							{ value: "direct", label: "Direct" },
							{ value: "escrow", label: "Escrow" },
						]}
						value={typeFilter}
						onChange={(e) => setTypeFilter(e.target.value)}
					/>
					<Select
						options={[
							{ value: "all", label: "All Status" },
							{ value: "completed", label: "Completed" },
							{ value: "active", label: "Active" },
							{ value: "cancelled", label: "Cancelled" },
						]}
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
					/>
					<Input
						placeholder="Filter by Agent ID..."
						value={agentFilter}
						onChange={(e) => setAgentFilter(e.target.value)}
						className="sm:w-60"
					/>
				</div>

				{isLoading ? (
					<div className="space-y-3">
						{Array.from({ length: 5 }).map((_, i) => (
							<Skeleton key={i} className="h-12 w-full" />
						))}
					</div>
				) : paginatedPayments.length === 0 ? (
					<EmptyState
						icon={ArrowLeftRight}
						message="No payments found."
						actionLabel="Send Payment"
						onAction={() => setPayDialogOpen(true)}
					/>
				) : (
					<>
						<Table>
							<TableHeader>
								<tr>
									<TableHead>Type</TableHead>
									<TableHead>From</TableHead>
									<TableHead>To</TableHead>
									<TableHead>Amount</TableHead>
									<TableHead>Fee</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>TX Hash</TableHead>
									<TableHead>Date</TableHead>
								</tr>
							</TableHeader>
							<TableBody>
								{paginatedPayments.map((p: any, i: number) => (
									<TableRow key={p.id || i}>
										<TableCell>
											<Badge variant={p.type === "escrow" ? "success" : "default"}>
												{p.type === "escrow" ? "Escrow" : "Direct"}
											</Badge>
										</TableCell>
										<TableCell>{shortenId(p.fromAgentId)}</TableCell>
										<TableCell>{shortenId(p.toAgentId)}</TableCell>
										<TableCell>{p.amount} A0GI</TableCell>
										<TableCell>{p.fee || "—"}</TableCell>
										<TableCell>
											<Badge variant={statusVariant[p.status] || "outline"}>
												{p.status}
											</Badge>
										</TableCell>
										<TableCell>
											{p.txHash ? (
												<span className="flex items-center gap-1">
													<span className="font-mono text-xs">{shortenId(p.txHash)}</span>
													<a
														href={`https://chainscan-newton.0g.ai/tx/${p.txHash}`}
														target="_blank"
														rel="noopener noreferrer"
														className="text-primary hover:text-primary-light"
														aria-label="View on explorer"
													>
														<ExternalLink className="h-3 w-3" />
													</a>
												</span>
											) : (
												"—"
											)}
										</TableCell>
										<TableCell>
											<Tooltip content={p.createdAt ? new Date(p.createdAt).toLocaleString() : ""}>
												<span>{p.createdAt ? timeAgo(p.createdAt) : "—"}</span>
											</Tooltip>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>

						{totalPages > 1 && (
							<div className="mt-4 flex items-center justify-center gap-2">
								<Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
									Previous
								</Button>
								<span className="text-sm text-text-secondary">
									Page {page + 1} of {totalPages}
								</span>
								<Button variant="ghost" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
									Next
								</Button>
							</div>
						)}
					</>
				)}
			</Card>

			<Dialog
				open={payDialogOpen}
				onClose={() => setPayDialogOpen(false)}
				title="Send Payment"
				footer={
					<div className="flex justify-end gap-3">
						<Button variant="ghost" onClick={() => setPayDialogOpen(false)}>Cancel</Button>
						<Button onClick={handlePay} loading={payDirect.isPending}>Send Payment</Button>
					</div>
				}
			>
				<div className="space-y-4">
					<Input label="From Agent ID" placeholder="0x..." value={payForm.fromAgentId} onChange={(e) => setPayForm({ ...payForm, fromAgentId: e.target.value })} />
					<Input label="Recipient Agent ID" placeholder="0x..." value={payForm.toAgentId} onChange={(e) => setPayForm({ ...payForm, toAgentId: e.target.value })} />
					<Select
						label="Token"
						options={[{ value: "0x0000000000000000000000000000000000000000", label: "Native (A0GI)" }]}
						value={payForm.token}
						onChange={(e) => setPayForm({ ...payForm, token: e.target.value })}
					/>
					<Input label="Amount" type="number" placeholder="0.0" value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} />
					{formError && <p className="text-sm text-danger">{formError}</p>}
				</div>
			</Dialog>

			<Dialog
				open={escrowDialogOpen}
				onClose={() => setEscrowDialogOpen(false)}
				title="Create Escrow"
				footer={
					<div className="flex justify-end gap-3">
						<Button variant="ghost" onClick={() => setEscrowDialogOpen(false)}>Cancel</Button>
						<Button onClick={handleCreateEscrow} loading={createEscrow.isPending}>Create Escrow</Button>
					</div>
				}
			>
				<div className="space-y-4">
					<Input label="Payer Agent ID" placeholder="0x..." value={escrowForm.payerAgentId} onChange={(e) => setEscrowForm({ ...escrowForm, payerAgentId: e.target.value })} />
					<Input label="Payee Agent ID" placeholder="0x..." value={escrowForm.payeeAgentId} onChange={(e) => setEscrowForm({ ...escrowForm, payeeAgentId: e.target.value })} />
					<Select
						label="Token"
						options={[{ value: "0x0000000000000000000000000000000000000000", label: "Native (A0GI)" }]}
						value={escrowForm.token}
						onChange={(e) => setEscrowForm({ ...escrowForm, token: e.target.value })}
					/>
					<Input label="Amount" type="number" placeholder="0.0" value={escrowForm.amount} onChange={(e) => setEscrowForm({ ...escrowForm, amount: e.target.value })} />
					<Input label="Job ID" placeholder="job-001" value={escrowForm.jobId} onChange={(e) => setEscrowForm({ ...escrowForm, jobId: e.target.value })} />
					<Input label="Deadline" type="datetime-local" value={escrowForm.deadline} onChange={(e) => setEscrowForm({ ...escrowForm, deadline: e.target.value })} />
					{formError && <p className="text-sm text-danger">{formError}</p>}
				</div>
			</Dialog>
		</div>
	);
}
