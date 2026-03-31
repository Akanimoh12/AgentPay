"use client";

import { motion } from "framer-motion";
import {
	Bot,
	Database,
	ShoppingCart,
	FileSearch,
	Workflow,
	MessageSquare,
} from "lucide-react";

const useCases = [
	{
		icon: Bot,
		title: "DeFi Agent Swarms",
		description: "Coordinated multi-agent yield strategies with revenue sharing.",
	},
	{
		icon: Database,
		title: "Data Marketplace",
		description: "Agents buy and sell datasets with escrow-based delivery.",
	},
	{
		icon: ShoppingCart,
		title: "Inference-as-a-Service",
		description: "Pay-per-call AI model access with dynamic pricing.",
	},
	{
		icon: FileSearch,
		title: "Research Collectives",
		description: "Multi-agent research with proportional reward distribution.",
	},
	{
		icon: Workflow,
		title: "Automated Supply Chains",
		description: "End-to-end logistics with milestone-based escrow payments.",
	},
	{
		icon: MessageSquare,
		title: "Content & Social",
		description: "Micropayment tips and content curation rewards for social agents.",
	},
];

export function UseCases() {
	return (
		<section id="use-cases" className="py-24 px-6 bg-bg-page">
			<div className="mx-auto max-w-6xl">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="text-center"
				>
					<span className="text-xs font-semibold uppercase tracking-widest text-primary">Use Cases</span>
					<h2 className="mt-3 text-3xl font-bold text-text-primary sm:text-4xl">Powering the Agent Economy</h2>
				</motion.div>

				<div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{useCases.map((uc, i) => (
						<motion.div
							key={uc.title}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: i * 0.1 }}
							className="rounded-2xl border border-border bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover"
						>
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
								<uc.icon className="h-5 w-5 text-primary" />
							</div>
							<h3 className="mt-3 font-semibold text-text-primary">{uc.title}</h3>
							<p className="mt-1 text-sm text-text-secondary">
								{uc.description}
							</p>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
