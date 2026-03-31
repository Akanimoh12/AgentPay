import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import { defineChain } from "viem";

export const zgChain = defineChain({
	id: parseInt(process.env.NEXT_PUBLIC_ZG_CHAIN_ID || "16602"),
	name: "0G Chain",
	nativeCurrency: { name: "A0GI", symbol: "A0GI", decimals: 18 },
	rpcUrls: {
		default: {
			http: [process.env.NEXT_PUBLIC_ZG_RPC_URL || "https://evmrpc-testnet.0g.ai"],
		},
	},
	blockExplorers: {
		default: { name: "0G Explorer", url: "https://chainscan-newton.0g.ai" },
	},
});

export const wagmiConfig = createConfig({
	chains: [zgChain],
	connectors: [injected()],
	transports: {
		[zgChain.id]: http(),
	},
	ssr: true,
});
