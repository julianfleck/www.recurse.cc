'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@recurse/ui/components';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  project: z.string().min(10, {
    message: 'Please describe your project in at least 10 characters.',
  }),
});

type FormData = z.infer<typeof formSchema>;

interface SignupFormProps {
  onSubmit?: (data: FormData) => void;
  className?: string;
}

export function SignupForm({ onSubmit, className = '' }: SignupFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      name: '',
      project: '',
    },
  });

  const handleSubmit = async (data: FormData) => {
    if (onSubmit) {
      onSubmit(data);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          projectDescription: data.project,
        }),
      });

      if (!response.ok) {
        await response.text();
        throw new Error(`Failed to submit form: ${response.status}`);
      }

      await response.json();
      setSubmitStatus('success');
      form.reset();
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={className}>
      <Form {...form}>
        <form className="space-y-0" onSubmit={form.handleSubmit(handleSubmit)}>
          {/* Responsive Grid: Stacked on mobile, side-by-side on desktop */}
          <div className="grid grid-cols-1 gap-0 border-border-accent border-b lg:grid-cols-2">
            {/* Left: Text content - always visible */}
            <div className="border-border-accent border-b p-8 md:p-12 lg:border-r lg:border-b-0">
              <div className="space-y-4">
                <h3 className="font-medium text-2xl">Join our Closed Beta</h3>
                <p className="text-muted-foreground leading-relaxed lg:pr-12">
                  We are currently looking for teams that are eager to put our
                  approach to the test. Teams that are developing AI assistants,
                  managing extensive corpora, or seeking to streamline their
                  knowledge workflows will benefit greatly from our structured
                  knowledge graphs. Join us to enhance your projects with
                  cutting-edge technology and collaborative opportunities.
                </p>
              </div>
            </div>

            {/* Right: Form fields or success message */}
            <div className="relative p-8 md:p-12">
              {/* Loading overlay - only on right side */}
              {isSubmitting && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/50 backdrop-blur-sm">
                  <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground text-sm">
                      Submitting your request...
                    </p>
                  </div>
                </div>
              )}

              {/* Success state - only on right side */}
              {submitStatus === 'success' ? (
                <div className="flex h-full min-h-[200px] items-center justify-center">
                  <div className="space-y-4 text-center">
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                      <Check
                        className="h-8 w-8 text-primary"
                        strokeWidth={1.5}
                      />
                    </div>
                    <div>
                      <h4 className="mb-2 font-medium text-xl">
                        Thank you for your interest
                      </h4>
                      <p className="text-muted-foreground">
                        We&apos;ll be in touch soon.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Form fields */
                <div
                  className={`space-y-4 transition-all duration-300 ${
                    isSubmitting ? 'opacity-50 blur-sm' : 'opacity-100 blur-0'
                  }`}
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
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
                        <FormLabel>Email</FormLabel>
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
                    name="project"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Describe your project</FormLabel>
                        <FormControl>
                          <Textarea
                            className="min-h-32"
                            placeholder="What would you build with recurse?"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormDescription>
                          Help us understand your use case better.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
          </div>

          {/* 1x1 Grid: Centered button - animated height collapse when success */}
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              submitStatus === 'success'
                ? 'max-h-0 opacity-0'
                : 'max-h-[200px] opacity-100'
            }`}
          >
            {submitStatus !== 'success' && (
              <div className="flex justify-center p-8 md:p-12">
                <Button
                  className="group px-8 py-3 text-base"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Requesting Access...
                    </>
                  ) : (
                    <>
                      Request Beta Access
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Error state */}
            {submitStatus === 'error' && (
              <div className="flex justify-center p-8 md:p-12">
                <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-600 text-sm">
                  <p className="font-medium">❌ Something went wrong</p>
                  <p>Please try again or email us directly.</p>
                </div>
              </div>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
