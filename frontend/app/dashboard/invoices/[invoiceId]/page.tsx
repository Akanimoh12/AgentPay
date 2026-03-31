"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, FileText } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { useInvoice } from "@/hooks/useInvoices";

const statusVariant: Record<string, "outline" | "default" | "success"> = {
	draft: "outline",
	finalized: "default",
	paid: "success",
};

export default function InvoiceDetailPage({
	params,
}: {
	params: Promise<{ invoiceId: string }>;
}) {
	const { invoiceId } = use(params);
	const { data: invoice, isLoading } = useInvoice(invoiceId);

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	if (!invoice) {
		return (
			<div className="flex flex-col items-center py-20">
				<FileText className="h-12 w-12 text-text-tertiary mb-4" />
				<p className="text-text-secondary">Invoice not found</p>
				<Link
					href="/dashboard/invoices"
					className="mt-4 text-sm text-primary hover:underline"
				>
					Back to Invoices
				</Link>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<Link
					href="/dashboard/invoices"
					className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition-colors mb-4"
				>
					<ArrowLeft className="h-4 w-4" />
					Back to Invoices
				</Link>
				<div className="flex items-center gap-3">
					<h1 className="text-2xl font-bold text-text-primary">
						Invoice {invoice.invoiceId?.slice(0, 12)}...
					</h1>
					<Badge variant={statusVariant[invoice.status] || "outline"}>
						{invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1)}
					</Badge>
				</div>
			</div>

			<Card title="Invoice Details">
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
					<div>
						<p className="text-xs uppercase tracking-wider text-text-tertiary mb-1">
							Invoice ID
						</p>
						<div className="flex items-center gap-2">
							<span className="font-mono text-sm text-text-primary break-all">
								{invoice.invoiceId}
							</span>
							<CopyButton text={invoice.invoiceId} />
						</div>
					</div>
					<div>
						<p className="text-xs uppercase tracking-wider text-text-tertiary mb-1">
							Amount
						</p>
						<span className="text-lg font-semibold text-text-primary">
							{invoice.amount} A0GI
						</span>
					</div>
					<div>
						<p className="text-xs uppercase tracking-wider text-text-tertiary mb-1">
							From
						</p>
						<div className="flex items-center gap-2">
							<span className="font-mono text-sm text-text-primary">
								{invoice.fromAgentName || invoice.fromAgentId}
							</span>
							<CopyButton text={invoice.fromAgentId} />
						</div>
					</div>
					<div>
						<p className="text-xs uppercase tracking-wider text-text-tertiary mb-1">
							To
						</p>
						<div className="flex items-center gap-2">
							<span className="font-mono text-sm text-text-primary">
								{invoice.toAgentName || invoice.toAgentId}
							</span>
							<CopyButton text={invoice.toAgentId} />
						</div>
					</div>
					<div className="sm:col-span-2">
						<p className="text-xs uppercase tracking-wider text-text-tertiary mb-1">
							Description
						</p>
						<p className="text-sm text-text-secondary">
							{invoice.description || "No description"}
						</p>
					</div>
					<div>
						<p className="text-xs uppercase tracking-wider text-text-tertiary mb-1">
							Created
						</p>
						<span className="text-sm text-text-secondary">
							{new Date(invoice.createdAt).toLocaleString()}
						</span>
					</div>
				</div>
			</Card>

			<Card title="0G Storage Verification">
				{invoice.storageKey ? (
					<div className="space-y-4">
						<div>
							<p className="text-xs uppercase tracking-wider text-text-tertiary mb-1">
								Storage Key
							</p>
							<div className="flex items-center gap-2">
								<span className="font-mono text-sm text-accent break-all">
									{invoice.storageKey}
								</span>
								<CopyButton text={invoice.storageKey} />
							</div>
						</div>
						<a
							href={`https://scan-testnet.0g.ai/storage/${invoice.storageKey}`}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
						>
							<ExternalLink className="h-4 w-4" />
							Verify on 0G Storage
						</a>
					</div>
				) : (
					<p className="text-sm text-text-tertiary">
						This invoice has not been written to 0G Storage yet.
					</p>
				)}
			</Card>

			{invoice.paymentTxHash && (
				<Card title="Linked Payment">
					<div className="flex items-center gap-3">
						<span className="text-sm text-text-secondary">Transaction:</span>
						<div className="flex items-center gap-2">
							<span className="font-mono text-sm text-text-primary">
								{invoice.paymentTxHash}
							</span>
							<CopyButton text={invoice.paymentTxHash} />
							<a
								href={`https://chainscan-newton.0g.ai/tx/${invoice.paymentTxHash}`}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="View transaction on explorer"
							>
								<ExternalLink className="h-3.5 w-3.5 text-text-tertiary hover:text-primary" />
							</a>
						</div>
					</div>
				</Card>
			)}
		</div>
	);
}
