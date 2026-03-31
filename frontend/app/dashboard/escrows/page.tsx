"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Dialog } from "@/components/ui/Dialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { CopyButton } from "@/components/ui/CopyButton";
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
} from "@/components/ui/Table";
import { useEscrows, useReleaseEscrow, useCancelEscrow } from "@/hooks/useEscrows";
import { useCreateEscrow } from "@/hooks/usePayments";
import { useToast } from "@/components/ui/Toast";

function shortenId(id: string) {
	if (!id) return "—";
	return id.length > 14 ? `${id.slice(0, 8)}...${id.slice(-4)}` : id;
}

const statusVariant: Record<string, "success" | "warning" | "danger"> = {
	active: "warning",
	released: "success",
	cancelled: "danger",
};

export default function EscrowsPage() {
	const searchParams = useSearchParams();
	const [statusFilter, setStatusFilter] = useState("all");
	const [agentFilter, setAgentFilter] = useState("");
	const [page, setPage] = useState(0);
	const [releaseTarget, setReleaseTarget] = useState<any>(null);
	const [cancelTarget, setCancelTarget] = useState<any>(null);
	const [createOpen, setCreateOpen] = useState(false);

	const filters: Record<string, string> = {};
	if (statusFilter !== "all") filters.status = statusFilter;
	if (agentFilter) filters.agentId = agentFilter;

	const { data: escrows, isLoading } = useEscrows(
		Object.keys(filters).length > 0 ? filters : undefined,
	);
	const releaseMutation = useReleaseEscrow();
	const cancelMutation = useCancelEscrow();
	const createEscrow = useCreateEscrow();
	const { toast } = useToast();

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
			setCreateOpen(true);
		}
	}, [searchParams]);

	const pageSize = 20;
	const all = escrows || [];
	const paginatedEscrows = all.slice(page * pageSize, (page + 1) * pageSize);
	const totalPages = Math.ceil(all.length / pageSize);

	const handleRelease = async () => {
		if (!releaseTarget) return;
		try {
			await releaseMutation.mutateAsync(releaseTarget.escrowId);
			setReleaseTarget(null);
			toast({ type: "success", message: "Escrow released successfully" });
		} catch (e: any) {
			toast({ type: "error", message: "Release failed", description: e.message });
		}
	};

	const handleCancel = async () => {
		if (!cancelTarget) return;
		try {
			await cancelMutation.mutateAsync(cancelTarget.escrowId);
			setCancelTarget(null);
			toast({ type: "success", message: "Escrow cancelled, funds reclaimed" });
		} catch (e: any) {
			toast({ type: "error", message: "Cancel failed", description: e.message });
		}
	};

	const handleCreate = async () => {
		setFormError("");
		if (!escrowForm.payerAgentId || !escrowForm.payeeAgentId || !escrowForm.amount) {
			setFormError("Required fields missing.");
			return;
		}
		try {
			const result = await createEscrow.mutateAsync(escrowForm);
			setCreateOpen(false);
			setEscrowForm({ payerAgentId: "", payeeAgentId: "", token: "0x0000000000000000000000000000000000000000", amount: "", jobId: "", deadline: "" });
			toast({ type: "success", message: "Escrow created successfully", description: result?.txHash ? `TX: ${result.txHash}` : undefined });
		} catch (e: any) {
			setFormError(e.message || "Failed.");
			toast({ type: "error", message: "Escrow creation failed", description: e.message });
		}
	};

	const isPastDeadline = (deadline: string) => {
		if (!deadline) return false;
		return new Date(deadline).getTime() < Date.now();
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold text-text-primary">Escrows</h1>
					<p className="text-sm text-text-secondary">
						Manage conditional escrow payments
					</p>
				</div>
				<Button onClick={() => setCreateOpen(true)}>Create Escrow</Button>
			</div>

			<Card>
				<div className="flex flex-col gap-3 sm:flex-row mb-4">
					<Select
						options={[
							{ value: "all", label: "All Status" },
							{ value: "active", label: "Active" },
							{ value: "released", label: "Released" },
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
				) : paginatedEscrows.length === 0 ? (
					<EmptyState
						icon={Lock}
						message="No escrows found."
						actionLabel="Create Escrow"
						onAction={() => setCreateOpen(true)}
					/>
				) : (
					<>
						<Table>
							<TableHeader>
								<tr>
									<TableHead>Escrow ID</TableHead>
									<TableHead>Payer</TableHead>
									<TableHead>Payee</TableHead>
									<TableHead>Amount</TableHead>
									<TableHead>Job ID</TableHead>
									<TableHead>Deadline</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Actions</TableHead>
								</tr>
							</TableHeader>
							<TableBody>
								{paginatedEscrows.map((e: any, i: number) => (
									<TableRow key={e.escrowId || e.id || i}>
										<TableCell>
											<span className="flex items-center gap-1 font-mono text-xs">
												{shortenId(e.escrowId || "")}
												{e.escrowId && <CopyButton text={e.escrowId} />}
											</span>
										</TableCell>
										<TableCell>{shortenId(e.payerAgentId)}</TableCell>
										<TableCell>{shortenId(e.payeeAgentId)}</TableCell>
										<TableCell>{e.amount} A0GI</TableCell>
										<TableCell>{e.jobId || "—"}</TableCell>
										<TableCell>
											<span
												className={
													e.status === "active" && isPastDeadline(e.deadline)
														? "text-danger"
														: ""
												}
											>
												{e.deadline
													? new Date(e.deadline).toLocaleDateString()
													: "—"}
											</span>
										</TableCell>
										<TableCell>
											<Badge variant={statusVariant[e.status] || "outline"}>
												{e.status}
											</Badge>
										</TableCell>
										<TableCell>
											{e.status === "active" && (
												<div className="flex gap-1">
													<Button
														size="sm"
														variant="ghost"
														className="text-success hover:text-success"
														onClick={() => setReleaseTarget(e)}
													>
														Release
													</Button>
													<Button
														size="sm"
														variant="ghost"
														className="text-danger hover:text-danger"
														disabled={!isPastDeadline(e.deadline)}
														onClick={() => setCancelTarget(e)}
													>
														Cancel
													</Button>
												</div>
											)}
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
				open={!!releaseTarget}
				onClose={() => setReleaseTarget(null)}
				title="Release Escrow"
				footer={
					<div className="flex justify-end gap-3">
						<Button variant="ghost" onClick={() => setReleaseTarget(null)}>Cancel</Button>
						<Button onClick={handleRelease} loading={releaseMutation.isPending}>Confirm Release</Button>
					</div>
				}
			>
				<p className="text-sm text-text-secondary">
					Are you sure you want to release this escrow? Funds will be sent to{" "}
					<span className="text-text-primary font-medium">
						{releaseTarget?.payeeAgentId ? shortenId(releaseTarget.payeeAgentId) : "payee"}
					</span>
					.
				</p>
			</Dialog>

			<Dialog
				open={!!cancelTarget}
				onClose={() => setCancelTarget(null)}
				title="Cancel Escrow"
				footer={
					<div className="flex justify-end gap-3">
						<Button variant="ghost" onClick={() => setCancelTarget(null)}>Back</Button>
						<Button variant="danger" onClick={handleCancel} loading={cancelMutation.isPending}>Cancel Escrow</Button>
					</div>
				}
			>
				<p className="text-sm text-text-secondary">
					Cancel this escrow and reclaim funds?
				</p>
			</Dialog>

			<Dialog
				open={createOpen}
				onClose={() => setCreateOpen(false)}
				title="Create Escrow"
				footer={
					<div className="flex justify-end gap-3">
						<Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
						<Button onClick={handleCreate} loading={createEscrow.isPending}>Create Escrow</Button>
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
