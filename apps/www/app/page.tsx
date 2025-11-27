"use client";

import { CTASection } from "@/components/common/CTASection";
import { Hero, About } from "@/components/landingpage/hero";
import { Features } from "@/components/landingpage/features";
import { ChatOrCodeSection } from "@/components/landingpage/chat-or-code";
import { BuildWithRecurseSection } from "@/components/landingpage/build-with-recurse";
import { ComparisonSection } from "@/components/landingpage/comparison";
import { SignupSection } from "@/components/landingpage/signup";

export default function HomePage() {
	return (
		<>
			{/* Hero + About Sections - no spacing between them */}
			<Hero />
			<About />

			{/* Features Section */}
			<div className="pt-1col">
				<Features />
			</div>

			{/* Chat or Code Section (non-developer focus) */}
			<div className="pt-1col">
				<ChatOrCodeSection />
			</div>

			{/* Build with Recurse Section (developer focus) */}
			<div className="pt-1col">
				<BuildWithRecurseSection />
			</div>

			{/* Comparison Section */}
			<div className="pt-1col">
				<ComparisonSection />
			</div>

			{/* Signup Form Section */}
			<div className="pt-1col">
				<SignupSection />
			</div>

			{/* Final CTA Section */}
			<div className="pt-1col">
				<CTASection />
			</div>
		</>
	);
}
