import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SplitVaultModule = buildModule("SplitVaultModule", (m) => {
	const splitVault = m.contract("SplitVault");
	return { splitVault };
});

export default SplitVaultModule;
