import { Button } from "@recurse/ui/components";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function CTASection() {
	return (
		<div className="relative z-10 mx-auto max-w-4xl pb-16">
			<div className="container mx-auto px-4 py-12 sm:px-6 md:px-12 md:py-20 lg:px-16 xl:px-20">
				<div className="mx-auto max-w-6xl text-left">
					<h2 className="mb-12 font-medium text-xl leading-[1.1] tracking-tight md:text-2xl lg:text-3xl">
						Context isn&apos;t optional anymore
					</h2>

					<div>
						<p className="mx-auto mb-12 max-w-5xl text-left font-light text-base text-muted-foreground leading-normal md:text-xl">
							Whether you&apos;re designing agents, research platforms, or
							adaptive interfaces — Recurse gives you the structure and semantic
							depth traditional tools lack. It&apos;s the memory substrate for
							AI-native infrastructure.
						</p>

						<div className="flex justify-start gap-4">
							<Button
								asChild
								className="!px-5 group rounded-full py-3 font-medium text-base"
								size="default"
								variant="outline"
							>
								<Link href="/about">
									Learn More
									<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
								</Link>
							</Button>
							<Button
								className="!px-5 group rounded-full py-3 font-medium text-base mix-blend-multiply"
								size="default"
								variant="ghost"
							>
								View Documentation
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
