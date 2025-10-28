import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import { remark } from "remark";
import remarkHtml from "remark-html";
import { getFAQsByIds } from "@/lib/faq-data";

type FAQProps = {
  items: string; // Comma-separated string of FAQ item IDs
  className?: string;
};

export function FAQ({ items, className }: FAQProps) {
  // Parse the comma-separated string of IDs
  const itemIds = items
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0);

  // Get the FAQ items from our data
  const faqItems = getFAQsByIds(itemIds);

  if (faqItems.length === 0 && itemIds.length > 0) {
    return (
      <div className={`text-muted-foreground ${className || ""}`}>
        No FAQ items found for the specified IDs: {items}
      </div>
    );
  }

  return (
    <div className={className}>
      <Accordions collapsible type="single">
        {faqItems.map((item) => (
          <Accordion key={item.id} title={item.title}>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html: remark()
                  .use(remarkHtml)
                  .processSync(item.content)
                  .toString(),
              }}
            />
          </Accordion>
        ))}
      </Accordions>
    </div>
  );
}
