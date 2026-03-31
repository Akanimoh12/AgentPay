"use client";

import { motion } from "framer-motion";
import {
	Fingerprint,
	Zap,
	Shield,
	TrendingUp,
	GitBranch,
	FileText,
} from "lucide-react";

const features = [
	{
		icon: Fingerprint,
		title: "Agent Identity",
		num: "01",
		description:
			"0G Agent ID binding with self-custodial wallets. Unique on-chain identity for every autonomous agent.",
	},
	{
		icon: Zap,
		title: "Micropayments",
		num: "02",
		description:
			"Sub-cent payments with instant settlement. Economically viable transactions for machine-to-machine commerce.",
	},
	{
		icon: Shield,
		title: "Smart Escrow",
		num: "03",
		description:
			"Conditional release with deadline protection. Trustless job-based payments between unknown agents.",
	},
	{
		icon: TrendingUp,
		title: "Dynamic Pricing",
		num: "04",
		description:
			"AI-powered pricing oracle via 0G Compute. Real-time fair market rates for any agent service.",
	},
	{
		icon: GitBranch,
		title: "Revenue Splits",
		num: "05",
		description:
			"Multi-party distribution with basis-point precision. Automated revenue sharing across agent collaborations.",
	},
	{
		icon: FileText,
		title: "Invoice History",
		num: "06",
		description:
			"Persistent records on 0G Storage. Immutable, verifiable audit trail for every transaction.",
	},
];

export function Features() {
	return (
		<section id="features" className="py-24 px-6 bg-white">
			<div className="mx-auto max-w-6xl">
				<div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
					>
						<span className="text-xs font-semibold uppercase tracking-widest text-primary">Core Features</span>
						<h2 className="mt-3 text-3xl font-bold text-text-primary sm:text-4xl">
							Built for Agent-to-Agent Commerce
						</h2>
						<p className="mt-4 text-lg leading-relaxed text-text-secondary">
							A complete financial toolkit that enables autonomous AI agents to transact,
							negotiate, and settle payments without human intervention.
						</p>
					</motion.div>

					<div className="grid gap-4 sm:grid-cols-2">
						{features.slice(0, 4).map((feature, i) => (
							<motion.div
								key={feature.title}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.5, delay: i * 0.1 }}
								className="group rounded-2xl border border-border bg-white p-5 shadow-card transition-all hover:shadow-card-hover hover:border-primary/30"
							>
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
										<feature.icon className="h-5 w-5 text-primary" />
									</div>
									<span className="text-xs font-bold text-primary/40">{feature.num}</span>
								</div>
								<h3 className="mt-3 text-base font-semibold text-text-primary">{feature.title}</h3>
								<p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
									{feature.description}
								</p>
							</motion.div>
						))}
					</div>
				</div>

				<div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
					{features.slice(4).map((feature, i) => (
						<motion.div
							key={feature.title}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: i * 0.1 }}
							className="group rounded-2xl border border-border bg-white p-5 shadow-card transition-all hover:shadow-card-hover hover:border-primary/30"
						>
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
									<feature.icon className="h-5 w-5 text-primary" />
								</div>
								<span className="text-xs font-bold text-primary/40">{feature.num}</span>
							</div>
							<h3 className="mt-3 text-base font-semibold text-text-primary">{feature.title}</h3>
							<p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
								{feature.description}
							</p>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
