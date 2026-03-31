"use client";

import { motion } from "framer-motion";

const stats = [
	{ value: "3", label: "Smart Contracts" },
	{ value: "4", label: "0G Integrations" },
	{ value: "Sub-second", label: "Settlement" },
	{ value: "< $0.01", label: "Fees" },
];

export function StatsBar() {
	return (
		<section className="border-y border-border bg-bg-page py-14">
			<div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
				{stats.map((stat, i) => (
					<motion.div
						key={stat.label}
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5, delay: i * 0.1 }}
						className="text-center"
					>
						<div className="text-3xl font-bold text-primary sm:text-4xl">
							{stat.value}
						</div>
						<div className="mt-2 text-sm text-text-secondary">{stat.label}</div>
					</motion.div>
				))}
			</div>
		</section>
	);
}
