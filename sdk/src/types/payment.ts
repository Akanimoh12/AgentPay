export type PaymentRequest = {
	recipientAgentId: string;
	token: string;
	amount: bigint;
};

export type DirectPaymentResult = {
	txHash: string;
	from: string;
	to: string;
	token: string;
	amount: bigint;
	fee: bigint;
};

export type EscrowRecord = {
	escrowId: string;
	payerId: string;
	payeeId: string;
	amount: bigint;
	token: string;
	jobId: string;
	deadline: bigint;
	released: boolean;
	cancelled: boolean;
	createdAt: bigint;
};

export enum EscrowStatus {
	Active = "active",
	Released = "released",
	Cancelled = "cancelled",
	Expired = "expired",
}
