export type AgentProfile = {
	wallet: string;
	agentId: string;
	name: string;
	services: string[];
	active: boolean;
	registeredAt: bigint;
};

export type RegisterAgentParams = {
	agentId: string;
	name: string;
	services: string[];
};

export type AgentService = {
	name: string;
	description?: string;
};
