"use client";

import React, { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import ScrollAnimation from "@/components/animations/ScrollAnimation/ScrollAnimation";
import { CTASection } from "@/components/common/CTASection";
import { Grid8Col, GridCell } from "@/components/layout/Grid8Col";
import { GridCard } from "@/components/layout/GridCard";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@recurse/ui/components/badge";
import { Input } from "@/components/ui/input";
import { Button, LinkButton } from "@recurse/ui/components";
import { getDocsUrl, cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { faqSections, type FAQ, type FAQSection } from "@/content/faq";

export default function FAQPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const isMobile = useIsMobile();

	// Extract all unique tags
	const allTags = useMemo(() => {
		const tags = new Set<string>();
		faqSections.forEach((section) => {
			section.faqs.forEach((faq) => {
				faq.tags.forEach((tag) => tags.add(tag));
			});
		});
		return Array.from(tags).sort();
	}, []);

	// Check if FAQ matches current filters
	const faqMatchesFilters = (faq: FAQ): boolean => {
		// Search filter
		const searchLower = searchQuery.toLowerCase();
		const matchesSearch =
			!searchQuery ||
			faq.question.toLowerCase().includes(searchLower) ||
			faq.answer.toLowerCase().includes(searchLower) ||
			faq.tags.some((tag) => tag.toLowerCase().includes(searchLower));

		// Tag filter
		const matchesTags =
			selectedTags.length === 0 ||
			selectedTags.some((selectedTag) => faq.tags.includes(selectedTag));

		return matchesSearch && matchesTags;
	};

	// Count matching questions
	const filteredCount = useMemo(() => {
		return faqSections.reduce((count, section) => {
			return count + section.faqs.filter((faq) => faqMatchesFilters(faq)).length;
		}, 0);
	}, [searchQuery, selectedTags]);

	const toggleTag = (tag: string) => {
		setSelectedTags((prev) =>
			prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
		);
	};

	const clearFilters = () => {
		setSearchQuery("");
		setSelectedTags([]);
	};

	const totalQuestions = faqSections.reduce(
		(acc, section) => acc + section.faqs.length,
		0
	);

	return (
		<>
			{/* Hero Section */}
			<div className="relative z-10 group/hero pt-halfcol">
				<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
					<Grid8Col>
						<GridCell colSpan={8} mdColSpan={8} lgColSpan={8}>
						<GridCard
							enableHoverEffect
							enableSpotlight
							className="px-1col py-1col lg:pl-2col lg:pr-2col"
						>
							<div className="space-y-8 text-left">
								<div className="space-y-6">
									<div className="font-semibold text-2xl leading-[1.15] tracking-tight text-foreground md:text-4xl lg:text-[2.5rem] lg:max-w-xl">
										<h1 className="font-semibold! text-foreground! leading-[1.15]! tracking-tight! m-0 p-0 text-2xl md:text-4xl lg:text-[2.5rem]">Frequently Asked Questions</h1>
									</div>
									<p className="text-base font-light text-muted-foreground md:text-lg">
										Find answers to common questions about Recurse, RAGE, memory infrastructure, and building context-aware AI.
									</p>
								</div>
							</div>
							</GridCard>
						</GridCell>
					</Grid8Col>
				</ScrollAnimation>
			</div>

			{/* Main Content Grid */}
			<div className="relative z-10">
				<Grid8Col>
					{/* Search and Filter Section - 2 columns, spans all rows */}
					<GridCell colSpan={8} lgColSpan={2} lgRowSpan="full">
							<div className="sticky top-16 z-20">
								<GridCard
									enableHoverEffect
									enableSpotlight
									className={cn(
										"px-1col py-1col md:p-6 space-y-6 flex flex-col justify-between",
										!isMobile && "min-h-[calc(100vh-64px)]"
									)}
								>
								<div>
									{/* Search Input */}
									<div className="relative">
										<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
										<Input
											type="text"
											placeholder="Search..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											className="pl-10 pr-10"
										/>
										{searchQuery && (
											<button
												type="button"
												onClick={() => setSearchQuery("")}
												className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
											>
												<X className="h-4 w-4" />
											</button>
										)}
									</div>

									{/* Filter Tags */}
									<div className="space-y-3 mt-4">
										<div className="flex items-center justify-end min-h-8">
											<Button
												variant="ghost"
												size="sm"
												onClick={clearFilters}
												className={`h-6 text-xs transition-opacity select-none ${
													searchQuery || selectedTags.length > 0
														? "opacity-100"
														: "opacity-0 pointer-events-none"
												}`}
											>
												Clear
											</Button>
										</div>
										<div className="flex flex-wrap gap-1.5">
											{allTags.map((tag) => {
												const isSelected = selectedTags.includes(tag);
												return (
													<Badge
														key={tag}
														variant={isSelected ? "primary" : "secondary"}
														appearance={isSelected ? "outline" : "light"}
														size="sm"
														className={cn(
															"cursor-pointer select-none transition-all",
															!isSelected && "hover:border-primary/30 hover:bg-primary/20 hover:text-accent-foreground text-foreground"
														)}
														onClick={() => toggleTag(tag)}
													>
														{tag}
													</Badge>
												);
											})}
										</div>
									</div>
								</div>

								{/* Results count */}
								<div className="text-xs text-muted-foreground select-none">
									{filteredCount}/{totalQuestions} results
								</div>
							</GridCard>
						</div>
					</GridCell>

					{/* FAQ Sections - 6 columns */}
					<GridCell colSpan={8} lgColSpan={6}>
						<div>
							{faqSections.map((section, sectionIndex) => {
								const matchingFaqsCount = section.faqs.filter((faq) =>
									faqMatchesFilters(faq)
								).length;
								const hasAnyMatch = matchingFaqsCount > 0;

								const shouldHideSection = !hasAnyMatch && (searchQuery || selectedTags.length > 0);

								return (
									<div 
										key={sectionIndex} 
										className={cn(
											"grid grid-cols-subgrid lg:grid-cols-6 gap-x-px gap-y-px",
											isMobile && shouldHideSection && "hidden"
										)}
									>
										{/* Section Label - 2 columns */}
										<div className="col-span-8 lg:col-span-2 flex flex-col">
											<GridCard
												enableHoverEffect
												enableSpotlight
												className={cn(
													"h-full p-0 transition-opacity duration-300",
													!isMobile && shouldHideSection && "opacity-30",
													!shouldHideSection && "opacity-100"
												)}
											>
												<div className="sticky top-16 z-10 px-1col py-1col md:p-6 flex flex-col justify-start">
													<h2 className="font-semibold text-foreground text-lg md:text-xl">
														{section.section}
													</h2>
													<p className="text-xs text-muted-foreground mt-2">
														{searchQuery || selectedTags.length > 0
															? `${matchingFaqsCount}/${section.faqs.length}`
															: section.faqs.length}{" "}
														{section.faqs.length === 1 ? "question" : "questions"}
													</p>
												</div>
											</GridCard>
										</div>

										{/* Questions Accordion - 4 columns */}
										<div className="col-span-8 lg:col-span-4">
											<GridCard
												enableHoverEffect
												enableSpotlight
												className={cn(
													"px-1col py-1col md:p-6 transition-opacity duration-300",
													!isMobile && shouldHideSection && "opacity-30",
													!shouldHideSection && "opacity-100"
												)}
											>
												<Accordion type="single" collapsible className="w-full">
													{section.faqs.map((faq, faqIndex) => {
														const matches = faqMatchesFilters(faq);
														const shouldHideFaq = !matches && (searchQuery || selectedTags.length > 0);
														return (
															<AccordionItem
																key={faqIndex}
																value={`${sectionIndex}-${faqIndex}`}
																className={cn(
																	"transition-opacity duration-300",
																	isMobile && shouldHideFaq && "hidden",
																	!isMobile && shouldHideFaq && "opacity-30",
																	!shouldHideFaq && "opacity-100"
																)}
															>
																<AccordionTrigger className="text-left font-medium text-muted-foreground text-sm md:text-base hover:no-underline hover:text-accent-foreground transition-colors">
																	{faq.question}
																</AccordionTrigger>
																<AccordionContent className="space-y-4">
																	<p className="font-light text-foreground text-sm leading-relaxed md:text-base">
																		{faq.answer}
																	</p>
																	{faq.docLink && (
																		<LinkButton href={`${getDocsUrl()}${faq.docLink.href}`} variant="secondary" size="sm" round={false}>
																			{faq.docLink.label}
																		</LinkButton>
																	)}
																	<div className="flex flex-wrap gap-1.5 pt-2">
																		{faq.tags.map((tag) => (
																			<Badge
																				key={tag}
																				variant="secondary"
																				appearance="light"
																				size="xs"
																				className="cursor-pointer select-none"
																				onClick={() => toggleTag(tag)}
																			>
																				{tag}
																			</Badge>
								))}
							</div>
																</AccordionContent>
															</AccordionItem>
														);
													})}
											</Accordion>
										</GridCard>
									</div>
								</div>
							);
						})}
						</div>
					</GridCell>
				</Grid8Col>
			</div>

			{/* CTA Section */}
			<CTASection />
		</>
	);
}
