export function Logo({ size = 32, className = "" }: { size?: number; className?: string }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 64 64"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<rect width="64" height="64" rx="16" fill="#5B45FF" />
			<path
				d="M20 44V20h6l10 16V20h6v24h-6L26 28v16h-6z"
				fill="white"
				opacity="0.15"
			/>
			<circle cx="32" cy="22" r="5" fill="white" />
			<path
				d="M22 34c0-5.523 4.477-10 10-10s10 4.477 10 10"
				stroke="white"
				strokeWidth="2.5"
				strokeLinecap="round"
				fill="none"
			/>
			<path
				d="M26 42l6-8 6 8"
				stroke="white"
				strokeWidth="2.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				fill="none"
			/>
			<circle cx="32" cy="46" r="2" fill="#00E5BF" />
			<path
				d="M18 30h4M42 30h4M18 38h4M42 38h4"
				stroke="white"
				strokeWidth="1.5"
				strokeLinecap="round"
				opacity="0.5"
			/>
		</svg>
	);
}

export function LogoMark({ size = 24, className = "" }: { size?: number; className?: string }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 64 64"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<rect width="64" height="64" rx="16" fill="#5B45FF" />
			<circle cx="32" cy="22" r="5" fill="white" />
			<path
				d="M22 34c0-5.523 4.477-10 10-10s10 4.477 10 10"
				stroke="white"
				strokeWidth="2.5"
				strokeLinecap="round"
				fill="none"
			/>
			<path
				d="M26 42l6-8 6 8"
				stroke="white"
				strokeWidth="2.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				fill="none"
			/>
			<circle cx="32" cy="46" r="2" fill="#00E5BF" />
			<path
				d="M18 30h4M42 30h4M18 38h4M42 38h4"
				stroke="white"
				strokeWidth="1.5"
				strokeLinecap="round"
				opacity="0.5"
			/>
		</svg>
	);
}
