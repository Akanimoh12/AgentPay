"use client";

import { useState } from "react";
import {
	GitBranch,
	Plus,
	Trash2,
	Play,
	Edit2,
	XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Dialog } from "@/components/ui/Dialog";
import { CopyButton } from "@/components/ui/CopyButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useSplits, useConfigureSplit, useDistribute } from "@/hooks/useSplits";

const SPLIT_COLORS = [
	"bg-primary",
	"bg-accent",
	"bg-warning",
	"bg-danger",
	"bg-success",
	"bg-purple-500",
	"bg-pink-500",
	"bg-sky-500",
	"bg-orange-500",
	"bg-teal-500",
];

function shortenAddress(addr: string) {
	if (!addr) return "";
	return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function SplitsPage() {
	const { data: splits, isLoading, isError, refetch } = useSplits();
	const configureSplit = useConfigureSplit();
	const distribute = useDistribute();

	const [configOpen, setConfigOpen] = useState(false);
	const [distributeOpen, setDistributeOpen] = useState(false);
	const [activeSplit, setActiveSplit] = useState<any>(null);

	const [configForm, setConfigForm] = useState({
		agentId: "",
		recipients: [
			{ wallet: "", percentage: "" },
			{ wallet: "", percentage: "" },
		] as { wallet: string; percentage: string }[],
	});

	const [distForm, setDistForm] = useState({ token: "native", amount: "" });

	const totalPercentage = configForm.recipients.reduce(
		(sum, r) => sum + (parseFloat(r.percentage) || 0),
		0,
	);

	const addRecipient = () => {
		if (configForm.recipients.length >= 10) return;
		setConfigForm((f) => ({
			...f,
			recipients: [...f.recipients, { wallet: "", percentage: "" }],
		}));
	};

	const removeRecipient = (index: number) => {
		if (configForm.recipients.length <= 2) return;
		setConfigForm((f) => ({
			...f,
			recipients: f.recipients.filter((_, i) => i !== index),
		}));
	};

	const updateRecipient = (
		index: number,
		field: "wallet" | "percentage",
		value: string,
	) => {
		setConfigForm((f) => ({
			...f,
			recipients: f.recipients.map((r, i) =>
				i === index ? { ...r, [field]: value } : r,
			),
		}));
	};

	const handleConfigure = async () => {
		const recipients = configForm.recipients.map((r) => ({
			wallet: r.wallet,
			shareBps: Math.round(parseFloat(r.percentage) * 100),
		}));
		await configureSplit.mutateAsync({
			agentId: configForm.agentId,
			recipients,
		});
		setConfigOpen(false);
		setConfigForm({
			agentId: "",
			recipients: [
				{ wallet: "", percentage: "" },
				{ wallet: "", percentage: "" },
			],
		});
	};

	const handleDistribute = async () => {
		if (!activeSplit) return;
		await distribute.mutateAsync({
			splitId: activeSplit.splitId || activeSplit.id,
			token: distForm.token === "native" ? "0x0000000000000000000000000000000000000000" : distForm.token,
			amount: distForm.amount,
		});
		setDistributeOpen(false);
		setDistForm({ token: "native", amount: "" });
		setActiveSplit(null);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-text-primary">Revenue Splits</h1>
					<p className="mt-1 text-sm text-text-secondary">
						Configure multi-party revenue distribution
					</p>
				</div>
				<Button onClick={() => setConfigOpen(true)}>
					<Plus className="h-4 w-4" />
					Configure Split
				</Button>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-64 w-full" />
					))}
				</div>
			) : isError ? (
				<div className="flex flex-col items-center py-8">
					<p className="text-sm text-danger mb-3">Failed to load splits</p>
					<Button variant="outline" size="sm" onClick={() => refetch()}>
						Retry
					</Button>
				</div>
			) : !splits?.length ? (
				<Card>
					<EmptyState
						icon={GitBranch}
						message="No revenue splits configured yet."
						actionLabel="Configure Split"
						onAction={() => setConfigOpen(true)}
					/>
				</Card>
			) : (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					{splits.map((split: any) => {
						const recipients = split.recipients || [];
						return (
							<Card key={split.id || split.splitId} className="relative">
								<div className="space-y-4">
									<div className="flex items-start justify-between">
										<div>
											<div className="flex items-center gap-2">
												<span className="font-mono text-xs text-text-tertiary">
													Split #{split.splitId || split.id}
												</span>
												<CopyButton text={String(split.splitId || split.id)} />
											</div>
											<p className="mt-1 text-sm font-medium text-text-primary">
												{split.ownerAgentName || shortenAddress(split.agentId || "")}
											</p>
										</div>
										<Badge
											variant={split.active !== false ? "success" : "outline"}
										>
											{split.active !== false ? "Active" : "Inactive"}
										</Badge>
									</div>

									<div className="flex h-3 w-full overflow-hidden rounded-full bg-bg-elevated">
										{recipients.map((r: any, i: number) => {
											const pct =
												r.shareBps != null
													? r.shareBps / 100
													: parseFloat(r.percentage) || 0;
											return (
												<div
													key={i}
													className={`${SPLIT_COLORS[i % SPLIT_COLORS.length]} transition-all`}
													style={{ width: `${pct}%` }}
													title={`${pct.toFixed(2)}%`}
												/>
											);
										})}
									</div>

									<div className="space-y-2">
										{recipients.map((r: any, i: number) => {
											const pct =
												r.shareBps != null
													? r.shareBps / 100
													: parseFloat(r.percentage) || 0;
											return (
												<div
													key={i}
													className="flex items-center justify-between text-sm"
												>
													<div className="flex items-center gap-2">
														<div
															className={`h-2.5 w-2.5 rounded-full ${SPLIT_COLORS[i % SPLIT_COLORS.length]}`}
														/>
														<span className="font-mono text-xs text-text-secondary">
															{shortenAddress(r.wallet)}
														</span>
														{r.label && (
															<span className="text-xs text-text-tertiary">
																({r.label})
															</span>
														)}
													</div>
													<span className="font-medium text-text-primary">
														{pct.toFixed(2)}%
													</span>
												</div>
											);
										})}
									</div>

									<div className="flex gap-2 border-t border-border pt-3">
										<Button
											variant="primary"
											size="sm"
											onClick={() => {
												setActiveSplit(split);
												setDistributeOpen(true);
											}}
										>
											<Play className="h-3.5 w-3.5" />
											Distribute
										</Button>
										<Button variant="outline" size="sm">
											<Edit2 className="h-3.5 w-3.5" />
											Edit
										</Button>
										<Button variant="ghost" size="sm">
											<XCircle className="h-3.5 w-3.5" />
											Deactivate
										</Button>
									</div>
								</div>
							</Card>
						);
					})}
				</div>
			)}

			<Dialog
				open={configOpen}
				onClose={() => setConfigOpen(false)}
				title="Configure Split"
				footer={
					<div className="flex items-center justify-between">
						<div className="text-sm">
							<span
								className={
									Math.abs(totalPercentage - 100) < 0.01
										? "text-success"
										: "text-danger"
								}
							>
								Total: {totalPercentage.toFixed(2)}%
							</span>
							{Math.abs(totalPercentage - 100) >= 0.01 && (
								<span className="ml-2 text-xs text-danger">Must equal 100%</span>
							)}
						</div>
						<div className="flex gap-3">
							<Button variant="outline" onClick={() => setConfigOpen(false)}>
								Cancel
							</Button>
							<Button
								loading={configureSplit.isPending}
								onClick={handleConfigure}
								disabled={
									!configForm.agentId ||
									Math.abs(totalPercentage - 100) >= 0.01 ||
									configForm.recipients.some((r) => !r.wallet || !r.percentage)
								}
							>
								Configure Split
							</Button>
						</div>
					</div>
				}
			>
				<div className="space-y-4">
					<Input
						label="Owner Agent ID"
						placeholder="0x..."
						value={configForm.agentId}
						onChange={(e) =>
							setConfigForm((f) => ({ ...f, agentId: e.target.value }))
						}
					/>
					<div>
						<label className="block text-sm font-medium text-text-secondary mb-2">
							Recipients
						</label>
						<div className="space-y-3">
							{configForm.recipients.map((r, i) => (
								<div key={i} className="flex items-center gap-2">
									<Input
										placeholder="Wallet address"
										value={r.wallet}
										onChange={(e) =>
											updateRecipient(i, "wallet", e.target.value)
										}
										className="flex-1"
									/>
									<div className="relative w-24">
										<Input
											type="number"
											placeholder="0.00"
											value={r.percentage}
											onChange={(e) =>
												updateRecipient(i, "percentage", e.target.value)
											}
										/>
										<span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-tertiary">
											%
										</span>
									</div>
									<button
										onClick={() => removeRecipient(i)}
										disabled={configForm.recipients.length <= 2}
										className="rounded p-1.5 text-text-tertiary hover:text-danger hover:bg-bg-elevated transition-colors disabled:opacity-30"
										aria-label="Remove recipient"
									>
										<Trash2 className="h-4 w-4" />
									</button>
								</div>
							))}
						</div>
						{configForm.recipients.length < 10 && (
							<Button
								variant="ghost"
								size="sm"
								onClick={addRecipient}
								className="mt-2"
							>
								<Plus className="h-3.5 w-3.5" />
								Add Recipient
							</Button>
						)}
					</div>
				</div>
			</Dialog>

			<Dialog
				open={distributeOpen}
				onClose={() => {
					setDistributeOpen(false);
					setActiveSplit(null);
				}}
				title="Distribute Funds"
				footer={
					<div className="flex justify-end gap-3">
						<Button
							variant="outline"
							onClick={() => {
								setDistributeOpen(false);
								setActiveSplit(null);
							}}
						>
							Cancel
						</Button>
						<Button
							loading={distribute.isPending}
							onClick={handleDistribute}
							disabled={!distForm.amount}
						>
							Distribute Funds
						</Button>
					</div>
				}
			>
				<div className="space-y-4">
					<Select
						label="Token"
						options={[
							{ value: "native", label: "A0GI (Native)" },
							{ value: "custom", label: "Custom ERC-20" },
						]}
						value={distForm.token}
						onChange={(e) =>
							setDistForm((f) => ({ ...f, token: e.target.value }))
						}
					/>
					<Input
						label="Amount"
						type="number"
						placeholder="0.00"
						value={distForm.amount}
						onChange={(e) =>
							setDistForm((f) => ({ ...f, amount: e.target.value }))
						}
					/>
					{activeSplit && distForm.amount && (
						<div className="rounded-lg border border-border bg-bg-elevated p-4">
							<p className="text-xs uppercase tracking-wider text-text-tertiary mb-3">
								Distribution Preview
							</p>
							<div className="space-y-2">
								{(activeSplit.recipients || []).map((r: any, i: number) => {
									const pct =
										r.shareBps != null
											? r.shareBps / 100
											: parseFloat(r.percentage) || 0;
									const share =
										(parseFloat(distForm.amount) * pct) / 100;
									return (
										<div
											key={i}
											className="flex items-center justify-between text-sm"
										>
											<div className="flex items-center gap-2">
												<div
													className={`h-2 w-2 rounded-full ${SPLIT_COLORS[i % SPLIT_COLORS.length]}`}
												/>
												<span className="font-mono text-xs text-text-secondary">
													{shortenAddress(r.wallet)}
												</span>
											</div>
											<span className="font-mono text-text-primary">
												{share.toFixed(4)} A0GI ({pct.toFixed(2)}%)
											</span>
										</div>
									);
								})}
							</div>
						</div>
					)}
				</div>
			</Dialog>
		</div>
	);
}
