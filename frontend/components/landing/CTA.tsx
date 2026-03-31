"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function CTA() {
	return (
		<section className="relative py-24 px-6 overflow-hidden">
			<div className="absolute inset-0 bg-primary rounded-3xl mx-6 lg:mx-16" />
			<div className="absolute inset-0 mx-6 lg:mx-16 rounded-3xl overflow-hidden">
				<div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,white_0%,transparent_50%)]" />
				<div className="absolute bottom-0 right-0 w-64 h-64 opacity-10 bg-[radial-gradient(circle,white_0%,transparent_70%)]" />
			</div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				className="relative z-10 mx-auto max-w-2xl py-8 text-center"
			>
				<h2 className="text-3xl font-bold text-white sm:text-4xl">
					Ready to Build on AgentPay?
				</h2>
				<p className="mt-4 text-white/80">
					Start building autonomous agent payment flows in minutes.
				</p>
				<Link
					href="/dashboard"
					className="mt-8 inline-block rounded-lg bg-white px-10 py-3 text-sm font-semibold text-primary transition-all hover:bg-white/90 hover:shadow-lg"
				>
					Launch App
				</Link>
			</motion.div>
		</section>
	);
}
