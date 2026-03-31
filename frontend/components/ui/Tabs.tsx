"use client";

import { useState } from "react";
import { clsx } from "clsx";

interface Tab {
	value: string;
	label: string;
}

interface TabsProps {
	tabs: Tab[];
	value: string;
	onChange: (value: string) => void;
	className?: string;
}

export function Tabs({ tabs, value, onChange, className }: TabsProps) {
	return (
		<div className={clsx("flex border-b border-border", className)}>
			{tabs.map((tab) => (
				<button
					key={tab.value}
					onClick={() => onChange(tab.value)}
					className={clsx(
						"px-4 py-2.5 text-sm font-medium transition-colors relative",
						value === tab.value
							? "text-primary"
							: "text-text-secondary hover:text-text-primary",
					)}
				>
					{tab.label}
					{value === tab.value && (
						<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
					)}
				</button>
			))}
		</div>
	);
}
