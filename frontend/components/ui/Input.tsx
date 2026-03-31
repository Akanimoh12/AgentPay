"use client";

import { forwardRef } from "react";
import { clsx } from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	({ label, error, className, id, ...props }, ref) => {
		const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
		return (
			<div className="space-y-1.5">
				{label && (
					<label htmlFor={inputId} className="block text-sm font-medium text-text-secondary">
						{label}
					</label>
				)}
				<input
					ref={ref}
					id={inputId}
					className={clsx(
						"w-full rounded-lg border bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20",
						error ? "border-danger focus:border-danger" : "border-border focus:border-border-focus",
						className,
					)}
					{...props}
				/>
				{error && <p className="text-xs text-danger">{error}</p>}
			</div>
		);
	},
);

Input.displayName = "Input";
