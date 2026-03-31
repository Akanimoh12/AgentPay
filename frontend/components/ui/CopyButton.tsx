"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CopyButtonProps {
	text: string;
	className?: string;
}

export function CopyButton({ text, className }: CopyButtonProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		await navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<button
			onClick={handleCopy}
			className={`relative inline-flex items-center justify-center rounded p-1 text-text-tertiary hover:text-text-primary hover:bg-bg-elevated transition-colors ${className || ""}`}
			aria-label="Copy to clipboard"
		>
			{copied ? (
				<>
					<Check className="h-3.5 w-3.5 text-success" />
					<span className="absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-bg-elevated px-2 py-0.5 text-xs text-success whitespace-nowrap">
						Copied!
					</span>
				</>
			) : (
				<Copy className="h-3.5 w-3.5" />
			)}
		</button>
	);
}
