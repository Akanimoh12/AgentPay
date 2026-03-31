export type SplitRecipient = {
	wallet: string;
	shareBps: number;
};

export type SplitConfig = {
	ownerAgentId: string;
	recipients: SplitRecipient[];
	active: boolean;
};

export type DistributionResult = {
	txHash: string;
	splitId: string;
	token: string;
	totalAmount: bigint;
};
