"use client";

import { useState } from "react";

interface TooltipProps {
	content: string;
	children: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
	const [visible, setVisible] = useState(false);

	return (
		<div
			className="relative inline-flex"
			onMouseEnter={() => setVisible(true)}
			onMouseLeave={() => setVisible(false)}
		>
			{children}
			{visible && (
				<div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 z-50">
					<div className="rounded-lg bg-bg-elevated border border-border px-3 py-1.5 text-xs text-text-primary whitespace-nowrap shadow-lg">
						{content}
					</div>
				</div>
			)}
		</div>
	);
}
