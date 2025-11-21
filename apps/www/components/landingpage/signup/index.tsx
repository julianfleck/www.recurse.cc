"use client";

import Link from "next/link";
import ScrollAnimation from "@/components/animations/ScrollAnimation/ScrollAnimation";
import { SignupForm } from "@/components/forms/SignupForm";
import { Grid8Col, GridCell } from "@/components/layout/Grid8Col";
import { GridCard } from "@/components/layout/GridCard";

export function SignupSection() {
	return (
		<ScrollAnimation enableFadeOut={true} exitBlur={2} exitScale={0.99}>
			<div id="signup" className="pb-1col group/signup scroll-mt-[80px]">
				<Grid8Col>
					{/* Column 1: Title and intro (2 cols) */}
					<GridCell colSpan={8} mdColSpan={8} lgColSpan={2}>
						<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between p-6 md:p-8">
							<h2 className="text-2xl md:text-3xl font-medium text-foreground leading-tight">
								Join our beta
							</h2>
							<p className="font-light text-muted-foreground text-xl leading-relaxed mt-auto pt-6">
								We are looking for teams that want to put our approach to the test
							</p>
						</GridCard>
					</GridCell>

					{/* Column 2: Description (2 cols) */}
					<GridCell colSpan={8} mdColSpan={8} lgColSpan={2}>
						<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between p-6 md:p-8">
							<p className="font-light text-foreground text-base leading-relaxed">
								Are you building AI assistants, managing extensive knowledge bases, or streamlining research
								workflows?
							</p>
							<p className="font-light text-muted-foreground text-sm leading-relaxed mt-auto pt-6">
								Tell us a bit about your use case and join our beta. We are currently onboarding new users on a bring your own key basis{" "}
								<Link href="/docs/getting-started/using-the-ui">(learn more).</Link>
							</p>
						</GridCard>
					</GridCell>

					{/* Column 3: Form (4 cols) */}
					<GridCell colSpan={8} mdColSpan={8} lgColSpan={4}>
						<SignupForm />
					</GridCell>
				</Grid8Col>
			</div>
		</ScrollAnimation>
	);
}

