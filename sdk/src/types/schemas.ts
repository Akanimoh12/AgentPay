import { z } from "zod";

export const ClientConfigSchema = z.object({
	rpcUrl: z.string().url(),
	chainId: z.number().int().positive(),
	contracts: z.object({
		agentRegistry: z.string(),
		paymentRouter: z.string(),
		splitVault: z.string(),
	}),
	privateKey: z.string().optional(),
	zgStorageEndpoint: z.string().optional(),
	zgComputeEndpoint: z.string().optional(),
});

export type ClientConfig = z.infer<typeof ClientConfigSchema>;

export const RegisterAgentParamsSchema = z.object({
	agentId: z.string(),
	name: z.string().min(1),
	services: z.array(z.string()),
});

export const PaymentRequestSchema = z.object({
	recipientAgentId: z.string(),
	token: z.string(),
	amount: z.bigint(),
});

export const SplitRecipientSchema = z.object({
	wallet: z.string(),
	shareBps: z.number().int().min(1).max(10000),
});

export const SplitRecipientsSchema = z
	.array(SplitRecipientSchema)
	.min(1)
	.max(10)
	.refine(
		(recipients) => recipients.reduce((sum, r) => sum + r.shareBps, 0) === 10000,
		{ message: "Share basis points must sum to 10000" },
	);

export const InvoiceFilterSchema = z.object({
	agentId: z.string().optional(),
	status: z.string().optional(),
	dateFrom: z.number().optional(),
	dateTo: z.number().optional(),
	counterparty: z.string().optional(),
});
