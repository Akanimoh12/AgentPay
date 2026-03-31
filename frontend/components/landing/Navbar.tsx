"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";

const navLinks = [
	{ label: "Features", href: "#features" },
	{ label: "How It Works", href: "#how-it-works" },
	{ label: "Use Cases", href: "#use-cases" },
	{ label: "Architecture", href: "#architecture" },
];

export function Navbar() {
	const [open, setOpen] = useState(false);

	return (
		<nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-white/80 backdrop-blur-xl">
			<div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
				<Link href="/" className="flex items-center gap-2.5">
					<LogoMark size={28} />
					<span className="text-xl font-bold text-text-primary">AgentPay</span>
				</Link>

				<div className="hidden items-center gap-8 md:flex">
					{navLinks.map((link) => (
						<a
							key={link.href}
							href={link.href}
							className="text-sm text-text-secondary transition-colors hover:text-primary"
						>
							{link.label}
						</a>
					))}
					<Link
						href="/dashboard"
						className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-dark hover:shadow-md"
					>
						Launch App
					</Link>
				</div>

				<button
					onClick={() => setOpen(!open)}
					className="text-text-secondary md:hidden"
					aria-label="Toggle menu"
				>
					{open ? <X size={24} /> : <Menu size={24} />}
				</button>
			</div>

			{open && (
				<div className="border-t border-border bg-white px-6 pb-4 md:hidden">
					{navLinks.map((link) => (
						<a
							key={link.href}
							href={link.href}
							onClick={() => setOpen(false)}
							className="block py-3 text-sm text-text-secondary"
						>
							{link.label}
						</a>
					))}
					<Link
						href="/dashboard"
						className="mt-2 block rounded-lg bg-primary px-5 py-2.5 text-center text-sm font-medium text-white"
					>
						Launch App
					</Link>
				</div>
			)}
		</nav>
	);
}
