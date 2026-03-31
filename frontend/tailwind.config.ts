import type { Config } from "tailwindcss";

const config: Config = {
	content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				primary: {
					DEFAULT: "#5B45FF",
					light: "#7B6AFF",
					dark: "#4030CC",
					50: "#F0EDFF",
					100: "#DDD8FF",
					200: "#BBB1FF",
				},
				accent: {
					DEFAULT: "#00E5BF",
					muted: "#00B89A",
				},
				bg: {
					DEFAULT: "#FFFFFF",
					card: "#FFFFFF",
					elevated: "#F7F7FB",
					page: "#FAFAFD",
				},
				border: {
					DEFAULT: "#E5E5F0",
					focus: "#5B45FF",
					strong: "#D0D0E0",
				},
				text: {
					primary: "#111111",
					secondary: "#6B7280",
					tertiary: "#9CA3AF",
				},
				danger: "#EF4444",
				warning: "#F59E0B",
				success: "#10B981",
				sidebar: {
					bg: "#FAFAFD",
					active: "#F0EDFF",
				},
			},
			backgroundImage: {
				"hero-gradient":
					"linear-gradient(135deg, #5B45FF 0%, #7B6AFF 50%, #00E5BF 100%)",
				"card-gradient":
					"linear-gradient(180deg, rgba(91,69,255,0.04) 0%, rgba(91,69,255,0.01) 100%)",
			},
			boxShadow: {
				card: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
				"card-hover": "0 4px 12px rgba(91,69,255,0.08), 0 1px 3px rgba(0,0,0,0.06)",
				elevated: "0 4px 24px rgba(0,0,0,0.06)",
			},
		},
	},
	plugins: [],
};

export default config;
