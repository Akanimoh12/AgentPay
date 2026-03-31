"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, GitBranch } from "lucide-react";

function FloatingCard({ icon: Icon, label, delay, className }: { icon: any; label: string; delay: number; className: string }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, delay }}
			className={`absolute ${className}`}
		>
			<motion.div
				animate={{ y: [0, -8, 0] }}
				transition={{ duration: 3, repeat: Infinity, delay: delay * 2 }}
				className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-elevated border border-border"
			>
				<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50">
					<Icon className="h-4 w-4 text-primary" />
				</div>
				<span className="text-sm font-medium text-text-primary">{label}</span>
			</motion.div>
		</motion.div>
	);
}

export function Hero() {
	return (
		<section className="relative overflow-hidden bg-white pt-20">
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
				<div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-accent/5 blur-3xl" />
				<div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(91,69,255,0.04) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
			</div>

			<div className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:py-32">
				<div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
					<div>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
							className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary"
						>
							<span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
							Built on 0G Chain
						</motion.div>

						<motion.h1
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.1 }}
							className="text-4xl font-bold leading-[1.1] tracking-tight text-text-primary sm:text-5xl lg:text-6xl"
						>
							Payment Infrastructure for the{" "}
							<span className="gradient-text">Agent Economy</span>
						</motion.h1>

						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							className="mt-6 max-w-lg text-lg leading-relaxed text-text-secondary"
						>
							Enable AI agents to send, receive, escrow, and split payments
							autonomously on 0G Chain with sub-second settlement and sub-cent fees.
						</motion.p>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.3 }}
							className="mt-10 flex flex-col gap-4 sm:flex-row"
						>
							<Link
								href="/dashboard"
								className="group inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/25"
							>
								Launch App
								<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
							</Link>
							<a
								href="https://docs.0g.ai"
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center justify-center rounded-lg border border-border bg-white px-8 py-3.5 text-sm font-semibold text-text-primary transition-all hover:border-primary/30 hover:shadow-sm"
							>
								Read Docs
							</a>
						</motion.div>
					</div>

					<div className="relative hidden lg:block">
						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.8, delay: 0.3 }}
							className="relative mx-auto w-full max-w-md"
						>
							<div className="relative rounded-2xl border border-border bg-white p-6 shadow-elevated">
								<div className="mb-4 flex items-center gap-3">
									<div className="h-3 w-3 rounded-full bg-danger/60" />
									<div className="h-3 w-3 rounded-full bg-warning/60" />
									<div className="h-3 w-3 rounded-full bg-success/60" />
									<span className="ml-2 text-xs text-text-tertiary">AgentPay Terminal</span>
								</div>

								<div className="space-y-3 font-mono text-xs">
									<div className="flex gap-2">
										<span className="text-primary">$</span>
										<span className="text-text-secondary">agent.register("InferenceBot")</span>
									</div>
									<div className="rounded-lg bg-bg-elevated p-3 text-text-secondary">
										<div className="text-success">✓ Agent registered on 0G Chain</div>
										<div className="mt-1 text-text-tertiary">Agent ID: 0x7a3f...c2d1</div>
									</div>
									<div className="flex gap-2">
										<span className="text-primary">$</span>
										<span className="text-text-secondary">pay.escrow(0.05, "inference-job")</span>
									</div>
									<div className="rounded-lg bg-bg-elevated p-3 text-text-secondary">
										<div className="text-success">✓ Escrow created — 0.05 A0GI locked</div>
										<div className="mt-1 text-text-tertiary">TX: 0x9b2e...f8a3</div>
									</div>
									<div className="flex gap-2">
										<span className="text-primary">$</span>
										<span className="text-text-secondary">escrow.release()</span>
									</div>
									<div className="rounded-lg bg-bg-elevated p-3 text-text-secondary">
										<div className="text-success">✓ Funds released to provider</div>
									</div>
								</div>
							</div>

							<FloatingCard icon={Zap} label="Instant Settlement" delay={0.5} className="-left-16 top-8" />
							<FloatingCard icon={Shield} label="Smart Escrow" delay={0.7} className="-right-12 top-32" />
							<FloatingCard icon={GitBranch} label="Revenue Splits" delay={0.9} className="-left-8 bottom-8" />
						</motion.div>
					</div>
				</div>
			</div>
		</section>
	);
}
