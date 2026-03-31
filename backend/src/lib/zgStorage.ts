import { getAgentPayClient } from "./agentpay.js";
import type { Invoice, InvoiceFilter, PaginatedInvoices } from "@agentpay/sdk";

export async function storeInvoice(invoice: Invoice): Promise<string> {
	const client = getAgentPayClient();
	return client.storage.writeInvoice(invoice);
}

export async function fetchInvoice(key: string): Promise<Invoice | null> {
	const client = getAgentPayClient();
	return client.storage.getInvoice(key);
}

export async function fetchAgentHistory(
	agentId: string,
	filters?: InvoiceFilter,
): Promise<PaginatedInvoices> {
	const client = getAgentPayClient();
	return client.storage.getPaymentHistory(agentId, filters);
}
