"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Bot, X } from "lucide-react";
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
import { useAgents, useRegisterAgent } from "@/hooks/useAgents";
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

export default function AgentsPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [serviceFilter, setServiceFilter] = useState("");
	const [dialogOpen, setDialogOpen] = useState(false);
	const [page, setPage] = useState(0);

	const { data: agents, isLoading } = useAgents({
		search,
		active: statusFilter,
		service: serviceFilter,
	});
	const registerMutation = useRegisterAgent();
	const { toast } = useToast();

	const [formAgentId, setFormAgentId] = useState("");
	const [formName, setFormName] = useState("");
	const [formServices, setFormServices] = useState<string[]>([]);
	const [serviceInput, setServiceInput] = useState("");
	const [formError, setFormError] = useState("");

	useEffect(() => {
		if (searchParams.get("action") === "register") {
			setDialogOpen(true);
		}
	}, [searchParams]);

	const handleRegister = async () => {
		setFormError("");
		if (!formAgentId || !formName) {
			setFormError("Agent ID and Name are required.");
			return;
		}
		try {
			const result = await registerMutation.mutateAsync({
				agentId: formAgentId,
				name: formName,
				services: formServices,
			});
			setDialogOpen(false);
			setFormAgentId("");
			setFormName("");
			setFormServices([]);
			router.replace("/dashboard/agents");
			toast({ type: "success", message: "Agent registered successfully", description: result?.txHash ? `TX: ${result.txHash}` : undefined });
		} catch (e: any) {
			setFormError(e.message || "Registration failed.");
			toast({ type: "error", message: "Registration failed", description: e.message });
		}
	};

	const addService = () => {
		if (serviceInput.trim() && !formServices.includes(serviceInput.trim())) {
			setFormServices([...formServices, serviceInput.trim()]);
			setServiceInput("");
		}
	};

	const pageSize = 20;
	const paginatedAgents = (agents || []).slice(page * pageSize, (page + 1) * pageSize);
	const totalPages = Math.ceil((agents || []).length / pageSize);

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold text-text-primary">Agents</h1>
					<p className="text-sm text-text-secondary">
						Manage registered agent identities
					</p>
				</div>
				<Button onClick={() => setDialogOpen(true)}>Register Agent</Button>
			</div>

			<Card>
				<div className="flex flex-col gap-3 sm:flex-row mb-4">
					<Input
						placeholder="Search by name or ID..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="sm:w-64"
					/>
					<Select
						options={[
							{ value: "all", label: "All Status" },
							{ value: "true", label: "Active" },
							{ value: "false", label: "Inactive" },
						]}
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
					/>
					<Input
						placeholder="Filter by service..."
						value={serviceFilter}
						onChange={(e) => setServiceFilter(e.target.value)}
						className="sm:w-48"
					/>
				</div>

				{isLoading ? (
					<div className="space-y-3">
						{Array.from({ length: 5 }).map((_, i) => (
							<Skeleton key={i} className="h-12 w-full" />
						))}
					</div>
				) : paginatedAgents.length === 0 ? (
					<EmptyState
						icon={Bot}
						message="No agents found. Register your first agent."
						actionLabel="Register Agent"
						onAction={() => setDialogOpen(true)}
					/>
				) : (
					<>
						<Table>
							<TableHeader>
								<tr>
									<TableHead>Name</TableHead>
									<TableHead>Agent ID</TableHead>
									<TableHead>Wallet</TableHead>
									<TableHead>Services</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Registered</TableHead>
								</tr>
							</TableHeader>
							<TableBody>
								{paginatedAgents.map((agent: any) => (
									<TableRow key={agent.agentId || agent.id}>
										<TableCell>
											<Link
												href={`/dashboard/agents/${agent.agentId}`}
												className="text-primary hover:underline font-medium"
											>
												{agent.name || "—"}
											</Link>
										</TableCell>
										<TableCell>
											<span className="flex items-center gap-1 font-mono text-xs">
												{shortenId(agent.agentId)}
												<CopyButton text={agent.agentId} />
											</span>
										</TableCell>
										<TableCell>
											<span className="flex items-center gap-1 font-mono text-xs">
												{shortenId(agent.wallet)}
												<CopyButton text={agent.wallet} />
											</span>
										</TableCell>
										<TableCell>
											<span className="text-xs text-text-secondary truncate max-w-[150px] inline-block">
												{(agent.services || []).join(", ") || "—"}
											</span>
										</TableCell>
										<TableCell>
											<Badge variant={agent.active ? "success" : "outline"}>
												{agent.active ? "Active" : "Inactive"}
											</Badge>
										</TableCell>
										<TableCell>
											{agent.registeredAt
												? timeAgo(agent.registeredAt)
												: "—"}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>

						{totalPages > 1 && (
							<div className="mt-4 flex items-center justify-center gap-2">
								<Button
									variant="ghost"
									size="sm"
									disabled={page === 0}
									onClick={() => setPage(page - 1)}
								>
									Previous
								</Button>
								<span className="text-sm text-text-secondary">
									Page {page + 1} of {totalPages}
								</span>
								<Button
									variant="ghost"
									size="sm"
									disabled={page >= totalPages - 1}
									onClick={() => setPage(page + 1)}
								>
									Next
								</Button>
							</div>
						)}
					</>
				)}
			</Card>

			<Dialog
				open={dialogOpen}
				onClose={() => setDialogOpen(false)}
				title="Register Agent"
				footer={
					<div className="flex justify-end gap-3">
						<Button variant="ghost" onClick={() => setDialogOpen(false)}>
							Cancel
						</Button>
						<Button
							onClick={handleRegister}
							loading={registerMutation.isPending}
						>
							Register Agent
						</Button>
					</div>
				}
			>
				<div className="space-y-4">
					<Input
						label="0G Agent ID"
						placeholder="0x..."
						value={formAgentId}
						onChange={(e) => setFormAgentId(e.target.value)}
					/>
					<p className="text-xs text-text-tertiary -mt-2">
						Your unique 0G Agent ID identifier.
					</p>
					<Input
						label="Name"
						placeholder="Agent name"
						value={formName}
						onChange={(e) => setFormName(e.target.value)}
					/>
					<div className="space-y-1.5">
						<label className="block text-sm font-medium text-text-secondary">
							Services
						</label>
						<div className="flex gap-2">
							<Input
								placeholder="Add a service..."
								value={serviceInput}
								onChange={(e) => setServiceInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										addService();
									}
								}}
							/>
							<Button
								variant="secondary"
								size="sm"
								onClick={addService}
							>
								Add
							</Button>
						</div>
						{formServices.length > 0 && (
							<div className="flex flex-wrap gap-2 mt-2">
								{formServices.map((s) => (
									<span
										key={s}
										className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary"
									>
										{s}
										<button
											onClick={() =>
												setFormServices(
													formServices.filter(
														(x) => x !== s,
													),
												)
											}
											aria-label={`Remove ${s}`}
										>
											<X className="h-3 w-3" />
										</button>
									</span>
								))}
							</div>
						)}
					</div>
					{formError && (
						<p className="text-sm text-danger">{formError}</p>
					)}
				</div>
			</Dialog>
		</div>
	);
}
