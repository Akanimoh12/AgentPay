"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAccount } from "wagmi";
import { LogoMark } from "@/components/ui/Logo";
import {
	LayoutDashboard,
	Bot,
	ArrowLeftRight,
	Lock,
	FileText,
	GitBranch,
	TrendingUp,
	ArrowLeft,
	Menu,
	X,
} from "lucide-react";

const navItems = [
	{ label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
	{ label: "Agents", icon: Bot, href: "/dashboard/agents" },
	{ label: "Payments", icon: ArrowLeftRight, href: "/dashboard/payments" },
	{ label: "Escrows", icon: Lock, href: "/dashboard/escrows" },
	{ label: "Invoices", icon: FileText, href: "/dashboard/invoices" },
	{ label: "Revenue Splits", icon: GitBranch, href: "/dashboard/splits" },
	{ label: "Oracle", icon: TrendingUp, href: "/dashboard/oracle" },
];

export function Sidebar() {
	const pathname = usePathname();
	const { isConnected } = useAccount();
	const [mobileOpen, setMobileOpen] = useState(false);

	const isActive = (href: string) => {
		if (href === "/dashboard") return pathname === "/dashboard";
		return pathname.startsWith(href);
	};

	const sidebarContent = (
		<div className="flex h-full flex-col bg-white border-r border-border">
			<div className="px-6 py-5">
				<Link href="/" className="flex items-center gap-2">
					<LogoMark size={24} />
					<span className="text-xl font-bold text-text-primary">AgentPay</span>
				</Link>
			</div>

			<nav className="flex-1 px-3 space-y-1">
				{navItems.map((item) => {
					const active = isActive(item.href);
					return (
						<Link
							key={item.href}
							href={item.href}
							onClick={() => setMobileOpen(false)}
							className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
								active
									? "bg-primary-50 text-primary border-l-2 border-primary"
									: "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
							}`}
						>
							<item.icon className="h-5 w-5 shrink-0" />
							{item.label}
						</Link>
					);
				})}
			</nav>

			<div className="px-3 pb-4 space-y-3">
				<Link
					href="/"
					className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary hover:text-primary hover:bg-bg-elevated transition-colors"
				>
					<ArrowLeft className="h-5 w-5" />
					Back to Home
				</Link>
				<div className="flex items-center gap-2 px-3 py-2 text-xs text-text-tertiary">
					<span
						className={`h-2 w-2 rounded-full ${
							isConnected ? "bg-success" : "bg-danger"
						}`}
					/>
					{isConnected ? "Connected" : "Not Connected"}
				</div>
			</div>
		</div>
	);

	return (
		<>
			<button
				onClick={() => setMobileOpen(true)}
				className="fixed left-4 top-4 z-50 rounded-lg bg-white shadow-card p-2 lg:hidden"
				aria-label="Open sidebar"
			>
				<Menu className="h-5 w-5 text-text-primary" />
			</button>

			{mobileOpen && (
				<div className="fixed inset-0 z-40 lg:hidden">
					<div
						className="absolute inset-0 bg-black/60"
						onClick={() => setMobileOpen(false)}
					/>
					<div className="relative z-50 h-full w-[260px]">
						<button
							onClick={() => setMobileOpen(false)}
							className="absolute right-3 top-4 z-50 p-1"
							aria-label="Close sidebar"
						>
							<X className="h-5 w-5 text-text-primary" />
						</button>
						{sidebarContent}
					</div>
				</div>
			)}

			<aside className="hidden lg:block w-[260px] shrink-0 border-r border-border">
				{sidebarContent}
			</aside>
		</>
	);
}
