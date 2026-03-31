import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { StatsBar } from "@/components/landing/StatsBar";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Architecture } from "@/components/landing/Architecture";
import { UseCases } from "@/components/landing/UseCases";
import { ZGIntegration } from "@/components/landing/ZGIntegration";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
	return (
		<>
			<Navbar />
			<Hero />
			<StatsBar />
			<Features />
			<HowItWorks />
			<Architecture />
			<UseCases />
			<ZGIntegration />
			<CTA />
			<Footer />
		</>
	);
}
