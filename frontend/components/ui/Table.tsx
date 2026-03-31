import { clsx } from "clsx";

interface TableProps {
	children: React.ReactNode;
	className?: string;
}

export function Table({ children, className }: TableProps) {
	return (
		<div className="w-full overflow-x-auto">
			<table className={clsx("w-full text-sm", className)}>{children}</table>
		</div>
	);
}

export function TableHeader({ children, className }: TableProps) {
	return (
		<thead className={clsx("border-b border-border", className)}>{children}</thead>
	);
}

export function TableBody({ children, className }: TableProps) {
	return <tbody className={className}>{children}</tbody>;
}

export function TableRow({ children, className, ...props }: TableProps & React.HTMLAttributes<HTMLTableRowElement>) {
	return (
		<tr
			className={clsx(
				"border-b border-border/50 transition-colors hover:bg-bg-elevated",
				className,
			)}
			{...props}
		>
			{children}
		</tr>
	);
}

export function TableHead({ children, className }: TableProps) {
	return (
		<th
			className={clsx(
				"px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary",
				className,
			)}
		>
			{children}
		</th>
	);
}

export function TableCell({ children, className }: TableProps) {
	return (
		<td className={clsx("px-4 py-3 text-text-primary", className)}>
			{children}
		</td>
	);
}
