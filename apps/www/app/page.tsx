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
			{/* Hero + Graph + About Sections */}
			<Hero />
			<About />

			{/* Features Section */}
			<Features />

			{/* Chat or Code Section (non-developer focus) - BEFORE Build with Recurse */}
			<ChatOrCodeSection />

			{/* Build with Recurse Section (developer focus) */}
			<BuildWithRecurseSection />

			{/* Comparison Section */}
			<ComparisonSection />

			{/* Signup Form Section */}
			<SignupSection />

			{/* Final CTA Section */}
			<CTASection />
		</>
	);
}
