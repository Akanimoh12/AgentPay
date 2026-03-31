"use client";

import { motion } from "framer-motion";

const layers = [
	{
		name: "Agent Layer",
		description: "Autonomous AI agents with self-custodial wallets and unique identities.",
		components: ["Agent Wallets", "SDK Integration", "Service Registry", "Payment Initiation"],
		color: "border-primary/50",
		bg: "bg-primary/5",
	},
	{
		name: "Protocol Layer",
		description: "Smart contracts governing payments, escrow, and revenue distribution.",
		components: ["AgentRegistry", "PaymentRouter", "SplitVault", "Fee Management"],
		color: "border-primary/30",
		bg: "bg-primary/3",
	},
	{
		name: "0G Infrastructure",
		description: "Decentralized chain, storage, compute, and identity services.",
		components: ["0G Chain", "0G Storage", "0G Compute", "0G Agent ID"],
		color: "border-accent/50",
		bg: "bg-accent/5",
	},
];

export function Architecture() {
	return (
		<section id="architecture" className="py-24 px-6">
			<div className="mx-auto max-w-5xl">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="text-center"
				>
					<span className="text-xs font-semibold uppercase tracking-widest text-primary">Architecture</span>
					<h2 className="mt-3 text-3xl font-bold text-text-primary sm:text-4xl">Three-Layer Stack</h2>
				</motion.div>

				<div className="mt-16 space-y-6">
					{layers.map((layer, i) => (
						<motion.div
							key={layer.name}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: i * 0.15 }}
							className={`rounded-2xl border ${layer.color} ${layer.bg} p-6 sm:p-8`}
						>
							<h3 className="text-xl font-semibold text-text-primary">{layer.name}</h3>
							<p className="mt-2 text-sm text-text-secondary">
								{layer.description}
							</p>
							<div className="mt-4 flex flex-wrap gap-2">
								{layer.components.map((comp) => (
									<span
										key={comp}
										className="rounded-full border border-border bg-bg-elevated px-3 py-1 text-xs text-text-secondary"
									>
										{comp}
									</span>
								))}
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
