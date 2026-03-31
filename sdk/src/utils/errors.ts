export class AgentPayError extends Error {
	code: string;

	constructor(message: string, code: string) {
		super(message);
		this.name = "AgentPayError";
		this.code = code;
	}
}

export class AgentNotFoundError extends AgentPayError {
	constructor(agentId: string) {
		super(`Agent not found: ${agentId}`, "AGENT_NOT_FOUND");
		this.name = "AgentNotFoundError";
	}
}

export class EscrowNotFoundError extends AgentPayError {
	constructor(escrowId: string) {
		super(`Escrow not found: ${escrowId}`, "ESCROW_NOT_FOUND");
		this.name = "EscrowNotFoundError";
	}
}

export class InsufficientFundsError extends AgentPayError {
	constructor() {
		super("Insufficient funds for this operation", "INSUFFICIENT_FUNDS");
		this.name = "InsufficientFundsError";
	}
}

export class OracleUnavailableError extends AgentPayError {
	constructor() {
		super("Oracle service is unavailable", "ORACLE_UNAVAILABLE");
		this.name = "OracleUnavailableError";
	}
}

export class StorageUnavailableError extends AgentPayError {
	constructor() {
		super("Storage service is unavailable", "STORAGE_UNAVAILABLE");
		this.name = "StorageUnavailableError";
	}
}
