// FAQ data structure for reusable FAQ component
// Each FAQ item has an id, title, and content (can be string or React element)

export type FAQItem = {
  id: string;
  title: string;
  content: string;
  category?: string;
};

export const faqItems: FAQItem[] = [
  // Registration FAQs
  {
    id: "how-to-signup",
    title: "How do I sign up for Recurse.cc?",
    content: `You can sign up for Recurse.cc through our invitation system. Visit the registration page and enter your invitation code. If you don't have an invitation code, you can request one by joining our waitlist or contacting our support team.`,
    category: "registration",
  },
  {
    id: "where-to-get-invites",
    title: "Where can I get an invitation code?",
    content:
      "Invitation codes are distributed through our community channels, partnerships, and waitlist. You can join our waitlist at [our website](https://recurse.cc) or reach out to our support team for assistance with invitations.",
    category: "registration",
  },
  {
    id: "account-verification",
    title: "How does account verification work?",
    content: `After signing up with an invitation code, you'll receive a verification email. Click the link in the email to verify your account and complete the setup process. This helps us ensure account security.`,
    category: "registration",
  },

  // Upload/Content FAQs
  {
    id: "upload-not-working",
    title: "Why isn't my upload working?",
    content: `There are several reasons your upload might fail:

- **File size limits**: Make sure your file is under the maximum size limit (typically 50MB)
- **File type**: Check that the file format is supported (PDF, DOCX, TXT, HTML, etc.)
- **Network issues**: Ensure you have a stable internet connection
- **API key**: Verify your API key is valid and hasn't expired

Try uploading a smaller test file first to isolate the issue.`,
    category: "upload",
  },
  {
    id: "content-not-appearing",
    title: "My uploaded content isn't appearing in search results",
    content: `If your content isn't showing up in search results:

1. **Processing time**: Content needs time to be processed and indexed (usually 5-15 minutes)
2. **Check processing status**: Use the document status API to see if processing is complete
3. **Search parameters**: Try adjusting your search query or field selection
4. **Document visibility**: Ensure the document was uploaded successfully and is accessible

You can check the processing status using: \`GET /documents/{doc_id}/processing-status\``,
    category: "upload",
  },
  {
    id: "supported-file-types",
    title: "What file types are supported for upload?",
    content: `Recurse.cc supports a wide variety of content types:

- **Documents**: PDF, DOCX, DOC, TXT, RTF
- **Web content**: HTML, Markdown, URLs
- **Code**: Source code files in any programming language
- **Presentations**: PPTX, PPT
- **Spreadsheets**: XLSX, XLS, CSV
- **Images**: PNG, JPG, JPEG (with OCR support)
- **Archives**: ZIP files containing supported content

For best results, use clear, well-structured content.`,
    category: "upload",
  },
  {
    id: "large-files",
    title: "How do I upload large files or multiple files?",
    content: `For large files and bulk uploads:

- **Single large files**: Use the \`POST /documents/upload\` endpoint for files up to 50MB
- **Bulk uploads**: Upload multiple files individually or use batch operations
- **URL uploads**: For web content, use the URL parameter instead of file upload
- **Processing time**: Large files may take longer to process

Consider breaking very large documents into smaller sections for faster processing.`,
    category: "upload",
  },

  // Search/Retrieval FAQs
  {
    id: "search-not-finding-content",
    title: "Why can't I find my content in search?",
    content: `If search isn't finding your content:

1. **Indexing delay**: New content needs time to be fully indexed (5-30 minutes)
2. **Search terms**: Try different keywords or phrases from your content
3. **Field selection**: Use different field sets (basic, content, summary, etc.)
4. **Filters**: Check if any filters are excluding your content
5. **Content quality**: Ensure your content has clear text and structure

Example search: \`GET /search?query=your-keywords&field_set=content&depth=2\``,
    category: "search",
  },
  {
    id: "search-depth-parameter",
    title: "What does the depth parameter do in search?",
    content: `The \`depth\` parameter controls how much of the knowledge graph to explore:

- **depth=1**: Returns only direct matches (fastest)
- **depth=2**: Includes one level of related content (balanced)
- **depth=3+**: Explores deeper connections (slower but more comprehensive)

Use higher depth for research tasks, lower depth for quick lookups. The default is usually 2.`,
    category: "search",
  },
  {
    id: "api-rate-limits",
    title: "What are the API rate limits?",
    content: `Current rate limits for Recurse.cc API:

- **Search requests**: 60 per minute
- **Document uploads**: 10 per minute
- **Document retrieval**: 120 per minute
- **Other endpoints**: 30 per minute

Rate limits reset every minute. If you exceed limits, you'll receive a 429 status code. Contact support for higher limits if needed.`,
    category: "api",
  },

  // Technical/Integration FAQs
  {
    id: "api-authentication",
    title: "How do I authenticate API requests?",
    content: `Use your API key in the X-API-KEY header:

\`\`\`bash
curl -H "X-API-KEY: your-api-key-here" \\
     -H "Accept: application/json" \\
     https://api.recurse.cc/search?query=test
\`\`\`

You can find your API key in your account dashboard under Settings > API Keys.`,
    category: "api",
  },
  {
    id: "integration-options",
    title: "What integration options are available?",
    content: `Recurse.cc offers multiple integration methods:

1. **REST API**: Full programmatic access to all features
2. **Web Dashboard**: Browser-based interface for manual operations
3. **Browser Extensions**: Direct web content capture
4. **MCP Protocol**: Integration with AI assistants and tools
5. **Webhooks**: Real-time notifications for processing events

Choose the integration method that best fits your workflow.`,
    category: "integration",
  },
  {
    id: "webhook-setup",
    title: "How do I set up webhooks for processing notifications?",
    content: `To set up webhooks for document processing notifications:

1. Configure your webhook URL in the dashboard
2. Specify which events you want to receive (processing_complete, processing_failed, etc.)
3. Implement your webhook endpoint to handle the payload
4. Test with a sample document upload

Webhook payloads include document ID, status, and processing metadata.`,
    category: "integration",
  },

  // Billing/Account FAQs
  {
    id: "billing-plans",
    title: "What are the different billing plans?",
    content: `Recurse.cc offers flexible pricing:

- **Free Tier**: 100 documents, 1GB storage, basic search
- **Pro**: $29/month - 10,000 documents, 100GB storage, advanced features
- **Enterprise**: Custom pricing for teams and organizations

All plans include core RAGE functionality with different usage limits.`,
    category: "billing",
  },
  {
    id: "usage-tracking",
    title: "How do I track my usage and limits?",
    content: `Monitor your usage through:

1. **Dashboard**: Real-time usage statistics and charts
2. **API Headers**: Rate limit headers in API responses
3. **Email notifications**: Alerts when approaching limits
4. **Billing page**: Detailed usage breakdown and history

You can upgrade your plan anytime from the billing section.`,
    category: "billing",
  },
];

// Helper function to get FAQs by IDs
export function getFAQsByIds(ids: string[]): FAQItem[] {
  return faqItems.filter((item) => ids.includes(item.id));
}

// Helper function to get FAQs by category
export function getFAQsByCategory(category: string): FAQItem[] {
  return faqItems.filter((item) => item.category === category);
}

// Helper function to get all categories
export function getCategories(): string[] {
  const categories = faqItems
    .map((item) => item.category)
    .filter((category): category is string => category !== undefined);
  return [...new Set(categories)];
}
