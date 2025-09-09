import React from 'react';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { getFAQsByIds, FAQItem } from '@/lib/faq-data';

interface FAQProps {
  items: string; // Comma-separated string of FAQ item IDs
  className?: string;
}

export function FAQ({ items, className }: FAQProps) {
  // Parse the comma-separated string of IDs
  const itemIds = items
    .split(',')
    .map(id => id.trim())
    .filter(id => id.length > 0);

  // Get the FAQ items from our data
  const faqItems = getFAQsByIds(itemIds);

  if (faqItems.length === 0) {
    return (
      <div className={`text-muted-foreground ${className || ''}`}>
        No FAQ items found for the specified IDs: {items}
      </div>
    );
  }

  return (
    <div className={className}>
      <Accordions type="single" collapsible>
        {faqItems.map((item) => (
          <Accordion
            key={item.id}
            title={item.title}
          >
            <div className="prose prose-sm max-w-none">
              {item.content}
            </div>
          </Accordion>
        ))}
      </Accordions>
    </div>
  );
}

// Helper component for rendering FAQ content with custom formatting
export function FAQContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="prose prose-sm max-w-none">
      {children}
    </div>
  );
}
