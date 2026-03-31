"use client";

import {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastItem {
	id: string;
	type: ToastType;
	message: string;
	description?: string;
}

interface ToastContextValue {
	toast: (opts: { type: ToastType; message: string; description?: string }) => void;
}

const ToastContext = createContext<ToastContextValue>({
	toast: () => {},
});

const icons: Record<ToastType, React.ReactNode> = {
	success: <CheckCircle className="h-5 w-5 text-success" />,
	error: <XCircle className="h-5 w-5 text-danger" />,
	info: <Info className="h-5 w-5 text-primary" />,
	warning: <AlertTriangle className="h-5 w-5 text-warning" />,
};

const borderColors: Record<ToastType, string> = {
	success: "border-l-success",
	error: "border-l-danger",
	info: "border-l-primary",
	warning: "border-l-warning",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<ToastItem[]>([]);

	const toast = useCallback(
		(opts: { type: ToastType; message: string; description?: string }) => {
			const id = Math.random().toString(36).slice(2);
			setToasts((prev) => [...prev, { id, ...opts }]);
		},
		[],
	);

	const dismiss = useCallback((id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	return (
		<ToastContext.Provider value={{ toast }}>
			{children}
			<div
				className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm"
				aria-live="polite"
			>
				<AnimatePresence mode="popLayout">
					{toasts.map((t) => (
						<ToastNotification key={t.id} item={t} onDismiss={dismiss} />
					))}
				</AnimatePresence>
			</div>
		</ToastContext.Provider>
	);
}

function ToastNotification({
	item,
	onDismiss,
}: {
	item: ToastItem;
	onDismiss: (id: string) => void;
}) {
	useEffect(() => {
		const timer = setTimeout(() => onDismiss(item.id), 5000);
		return () => clearTimeout(timer);
	}, [item.id, onDismiss]);

	return (
		<motion.div
			layout
			initial={{ opacity: 0, x: 40, scale: 0.95 }}
			animate={{ opacity: 1, x: 0, scale: 1 }}
			exit={{ opacity: 0, x: 40, scale: 0.95 }}
			transition={{ duration: 0.2 }}
			className={`rounded-lg border border-border bg-white shadow-elevated border-l-4 ${borderColors[item.type]} p-4 pr-10 relative`}
		>
			<button
				onClick={() => onDismiss(item.id)}
				className="absolute right-2 top-2 rounded p-1 text-text-tertiary hover:text-text-primary transition-colors"
				aria-label="Dismiss notification"
			>
				<X className="h-3.5 w-3.5" />
			</button>
			<div className="flex gap-3">
				<div className="shrink-0 mt-0.5">{icons[item.type]}</div>
				<div>
					<p className="text-sm font-medium text-text-primary">{item.message}</p>
					{item.description && (
						<p className="mt-1 text-xs text-text-secondary">{item.description}</p>
					)}
				</div>
			</div>
		</motion.div>
	);
}

export function useToast() {
	return useContext(ToastContext);
}
