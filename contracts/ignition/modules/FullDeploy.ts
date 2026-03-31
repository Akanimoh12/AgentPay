import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import AgentRegistryModule from "./AgentRegistry";
import PaymentRouterModule from "./PaymentRouter";
import SplitVaultModule from "./SplitVault";

const FullDeployModule = buildModule("FullDeployModule", (m) => {
	const { agentRegistry } = m.useModule(AgentRegistryModule);
	const { paymentRouter } = m.useModule(PaymentRouterModule);
	const { splitVault } = m.useModule(SplitVaultModule);

	return { agentRegistry, paymentRouter, splitVault };
});

export default FullDeployModule;
