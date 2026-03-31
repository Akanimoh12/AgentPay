import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import AgentRegistryModule from "./AgentRegistry";

const PaymentRouterModule = buildModule("PaymentRouterModule", (m) => {
	const { agentRegistry } = m.useModule(AgentRegistryModule);
	const paymentRouter = m.contract("PaymentRouter", [agentRegistry]);
	return { paymentRouter };
});

export default PaymentRouterModule;
