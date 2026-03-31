import { LogoMark } from "@/components/ui/Logo";

export function Footer() {
	return (
		<footer className="border-t border-border bg-white py-8 px-6">
			<div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
				<div className="flex items-center gap-2">
					<LogoMark size={20} />
					<p className="text-sm text-text-tertiary">
						&copy; 2025 AgentPay
					</p>
				</div>
				<div className="flex gap-6">
					<a
						href="https://github.com"
						target="_blank"
						rel="noopener noreferrer"
						className="text-sm text-text-tertiary transition-colors hover:text-text-secondary"
					>
						GitHub
					</a>
					<a
						href="/docs"
						className="text-sm text-text-tertiary transition-colors hover:text-text-secondary"
					>
						Docs
					</a>
					<a
						href="https://0g.ai"
						target="_blank"
						rel="noopener noreferrer"
						className="text-sm text-text-tertiary transition-colors hover:text-text-secondary"
					>
						0G Foundation
					</a>
				</div>
			</div>
		</footer>
	);
}
