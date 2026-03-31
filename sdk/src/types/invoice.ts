export type InvoiceLineItem = {
	description: string;
	quantity: number;
	unitPrice: bigint;
	total: bigint;
};

export type Invoice = {
	invoiceId: string;
	fromAgentId: string;
	toAgentId: string;
	amount: bigint;
	description: string;
	lineItems: InvoiceLineItem[];
	status: "draft" | "sent" | "paid" | "cancelled";
	createdAt: number;
	storageKey?: string;
};

export type InvoiceFilter = {
	agentId?: string;
	status?: string;
	dateFrom?: number;
	dateTo?: number;
	counterparty?: string;
};

export type PaginatedInvoices = {
	items: Invoice[];
	total: number;
	offset: number;
	limit: number;
};
