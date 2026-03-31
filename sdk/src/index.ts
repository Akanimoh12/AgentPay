export { AgentPayClient, createAgentPayClient } from "./client.js";

export { RegistryModule } from "./modules/registry.js";
export { PaymentsModule } from "./modules/payments.js";
export { SplitsModule } from "./modules/splits.js";
export { StorageModule } from "./modules/storage.js";
export { OracleModule } from "./modules/oracle.js";

export * from "./types/index.js";

export {
	isNativeToken,
	shortenAddress,
} from "./utils/addresses.js";
export {
	formatTokenAmount,
	parseTokenAmount,
	bpsToPercent,
	percentToBps,
} from "./utils/amounts.js";
export {
	AgentPayError,
	AgentNotFoundError,
	EscrowNotFoundError,
	InsufficientFundsError,
	OracleUnavailableError,
	StorageUnavailableError,
} from "./utils/errors.js";
export {
	NATIVE_TOKEN,
	MAX_SPLIT_RECIPIENTS,
	MAX_FEE_BPS,
	BPS_DENOMINATOR,
} from "./utils/constants.js";
