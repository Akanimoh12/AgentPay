"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface DialogProps {
	open: boolean;
	onClose: () => void;
	title?: string;
	children: React.ReactNode;
	footer?: React.ReactNode;
}

export function Dialog({ open, onClose, title, children, footer }: DialogProps) {
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		},
		[onClose],
	);

	useEffect(() => {
		if (open) {
			document.addEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "hidden";
		}
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "";
		};
	}, [open, handleKeyDown]);

	return (
		<AnimatePresence>
			{open && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="absolute inset-0 bg-black/30 backdrop-blur-sm"
						onClick={onClose}
					/>
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 10 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 10 }}
						transition={{ duration: 0.15 }}
						className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-white shadow-elevated max-h-[90vh] overflow-y-auto"
						role="dialog"
						aria-modal="true"
						aria-label={title}
					>
						<div className="flex items-center justify-between border-b border-border px-6 py-4">
							{title && (
								<h2 className="text-lg font-semibold text-text-primary">{title}</h2>
							)}
							<button
								onClick={onClose}
								className="rounded-lg p-1.5 text-text-tertiary hover:bg-bg-elevated hover:text-text-primary transition-colors"
								aria-label="Close dialog"
							>
								<X className="h-5 w-5" />
							</button>
						</div>
						<div className="p-6">{children}</div>
						{footer && (
							<div className="border-t border-border px-6 py-4">{footer}</div>
						)}
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}
