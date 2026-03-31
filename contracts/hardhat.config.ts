import "@nomicfoundation/hardhat-ignition-ethers";
import { HardhatUserConfig } from "hardhat/config";
import * as dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const config: HardhatUserConfig = {
	solidity: {
		version: "0.8.24",
		settings: {
			optimizer: {
				enabled: true,
				runs: 200,
			},
			viaIR: true,
		},
	},
	networks: {
		hardhat: {},
		zgTestnet: {
			url: process.env.ZG_RPC_URL || "https://evmrpc-testnet.0g.ai",
			chainId: Number(process.env.ZG_CHAIN_ID) || 16602,
			accounts: process.env.DEPLOYER_PRIVATE_KEY
				? [process.env.DEPLOYER_PRIVATE_KEY]
				: [],
		},
	},
	typechain: {
		target: "ethers-v6",
		outDir: "typechain-types",
	},
};

export default config;
