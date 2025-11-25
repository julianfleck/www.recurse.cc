"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Combobox, type ComboboxOption } from "@recurse/ui/components";
import { ArrowRight, Check, HelpCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GridCard } from "@/components/layout/GridCard";

const ACCESS_LEVELS = [
	{
		value: "ui",
		label: "UI-Only Access",
		description: "Dashboard, uploads, and graph view",
	},
	{
		value: "api",
		label: "API Access",
		description: "Programmatic integration only",
	},
	{
		value: "proxy",
		label: "Proxy Access",
		description: "OpenAI-compatible proxy",
	},
	{
		value: "full",
		label: "Full Access",
		description: "Complete UI and API access",
	},
] as const;

const formSchema = z.object({
	email: z.string().email({
		message: "Please enter a valid email address.",
	}),
	name: z.string().min(2, {
		message: "Name must be at least 2 characters.",
	}),
	accessLevel: z.array(z.enum(["ui", "api", "proxy", "full"])).min(1, {
		message: "Please select at least one access level.",
	}),
	project: z.string().min(10, {
		message: "Please describe your project in at least 10 characters.",
	}),
});

type FormData = z.infer<typeof formSchema>;

interface SignupFormProps {
	onSubmit?: (data: FormData) => void;
	className?: string;
}

export function SignupForm({ onSubmit, className = "" }: SignupFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitStatus, setSubmitStatus] = useState<
		"idle" | "success" | "error"
	>("idle");

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			name: "",
			accessLevel: ["ui"],
			project: "",
		},
	});

	const handleSubmit = async (data: FormData) => {
		if (onSubmit) {
			onSubmit(data);
			return;
		}

		setIsSubmitting(true);
		setSubmitStatus("idle");

		try {
			const response = await fetch("/api/signup", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: data.name,
					email: data.email,
					accessLevel: data.accessLevel,
					projectDescription: data.project,
				}),
			});

			if (!response.ok) {
				await response.text();
				throw new Error(`Failed to submit form: ${response.status}`);
			}

			await response.json();
			setSubmitStatus("success");
			form.reset();
		} catch {
			setSubmitStatus("error");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<GridCard enableHoverEffect enableSpotlight className={`px-1col py-1col md:p-8 ${className}`}>
			<Form {...form}>
				<form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
					{/* Success state */}
					{submitStatus === "success" ? (
						<div className="flex items-center justify-center py-12">
							<div className="space-y-4 text-center">
								<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-chart-3/10 border border-chart-3/40">
									<Check className="h-8 w-8 text-chart-3" strokeWidth={2} />
								</div>
								<div className="space-y-2">
									<h4 className="font-medium text-xl text-foreground">
										Thank you for your interest
									</h4>
									<p className="font-light text-muted-foreground text-sm">
										We&apos;ll be in touch soon.
									</p>
								</div>
							</div>
						</div>
					) : (
						<>
							{/* Form fields */}
							<div className="space-y-4">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input
													placeholder="Your name"
													{...field}
													disabled={isSubmitting}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input
													placeholder="your@email.com"
													type="email"
													{...field}
													disabled={isSubmitting}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="accessLevel"
									render={({ field }) => (
										<FormItem>
											<FormDescription className="flex items-center gap-1 my-2 text-sm">
												Choose the level of access you need.
												<Link
													href="/docs/getting-started/beta#access-levels-explained"
													target="_blank"
													rel="noopener noreferrer"
													className="inline-flex items-center text-primary hover:underline"
												>
													<HelpCircle className="h-3 w-3" />
												</Link>
											</FormDescription>
											<FormControl>
												<Combobox
													options={ACCESS_LEVELS}
													value={field.value}
													onValueChange={(newValue) => {
														const values = Array.isArray(newValue) ? newValue : [newValue];
														// If "full" is selected, select all options
														if (values.includes("full")) {
															field.onChange(["ui", "api", "proxy", "full"]);
														} else {
															field.onChange(values);
														}
													}}
													placeholder="Select access level..."
													disabled={isSubmitting}
													multiple
													showSearch={false}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="project"
									render={({ field }) => (
										<FormItem>
											<FormDescription className="my-2 text-sm">
												Help us understand your use case better.
											</FormDescription>
											<FormControl>
												<Textarea
													className="min-h-32"
													placeholder="What would you build with Recurse?"
													{...field}
													disabled={isSubmitting}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* Submit button */}
							<div className="flex justify-start">
								<Button
									className="group"
									disabled={isSubmitting}
									type="submit"
									size="lg"
								>
									{isSubmitting ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Requesting Access...
										</>
									) : (
										<>
											Request Access
											<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
										</>
									)}
								</Button>
							</div>

							{/* Error state */}
							{submitStatus === "error" && (
								<div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm">
									<p className="font-medium text-destructive">Something went wrong</p>
									<p className="text-destructive/80">Please try again or email us directly.</p>
								</div>
							)}
						</>
					)}
				</form>
			</Form>
		</GridCard>
	);
}
