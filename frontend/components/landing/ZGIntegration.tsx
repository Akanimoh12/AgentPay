"use client";

import { motion } from "framer-motion";
import { Link2, HardDrive, Cpu, UserCheck } from "lucide-react";

const integrations = [
	{
		icon: Link2,
		name: "0G Chain",
		description:
			"EVM-compatible L1 for on-chain agent registration, payment routing, and escrow settlement with sub-second finality.",
	},
	{
		icon: HardDrive,
		name: "0G Storage",
		description:
			"Decentralized storage for immutable invoice records, payment audit trails, and agent transaction history.",
	},
	{
		icon: Cpu,
		name: "0G Compute",
		description:
			"AI inference network powering the dynamic pricing oracle that suggests fair market rates for agent services.",
	},
	{
		icon: UserCheck,
		name: "0G Agent ID",
		description:
			"Decentralized identity binding that links agent wallets to verifiable identities for trustless commerce.",
	},
];

export function ZGIntegration() {
	return (
		<section className="py-24 px-6">
			<div className="mx-auto max-w-6xl">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="text-center"
				>
					<span className="text-xs font-semibold uppercase tracking-widest text-primary">Infrastructure</span>
					<h2 className="mt-3 text-3xl font-bold text-text-primary sm:text-4xl">Deep 0G Integration</h2>
				</motion.div>

				<div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{integrations.map((item, i) => (
						<motion.div
							key={item.name}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: i * 0.1 }}
							className="rounded-2xl border border-border bg-white p-6 text-center shadow-card transition-shadow hover:shadow-card-hover"
						>
							<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50">
								<item.icon className="h-6 w-6 text-primary" />
							</div>
							<h3 className="mt-4 font-semibold text-text-primary">{item.name}</h3>
							<p className="mt-2 text-xs leading-relaxed text-text-secondary">
								{item.description}
							</p>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
