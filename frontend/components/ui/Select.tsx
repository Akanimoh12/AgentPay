"use client";

import { forwardRef } from "react";
import { clsx } from "clsx";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
	label?: string;
	error?: string;
	options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
	({ label, error, options, className, id, ...props }, ref) => {
		const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");
		return (
			<div className="space-y-1.5">
				{label && (
					<label htmlFor={selectId} className="block text-sm font-medium text-text-secondary">
						{label}
					</label>
				)}
				<select
					ref={ref}
					id={selectId}
					className={clsx(
						"w-full rounded-lg border bg-white px-3 py-2 text-sm text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none",
						error ? "border-danger" : "border-border focus:border-border-focus",
						className,
					)}
					{...props}
				>
					{options.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</select>
				{error && <p className="text-xs text-danger">{error}</p>}
			</div>
		);
	},
);

Select.displayName = "Select";
