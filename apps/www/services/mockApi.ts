import type {
	Document,
	Frame,
	RelatedItem,
	Section,
	Session,
} from "@/models/api/types";

// Mock data storage
const documents: Document[] = [
	{
		id: "doc-1",
		title: "Research Paper.pdf",
		type: "document",
		inScope: true,
		createdAt: new Date("2024-01-15"),
		updatedAt: new Date("2024-01-20"),
		content: `# Research Paper

## Introduction

This is the introduction section of the document. It provides an overview of the main topics covered.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

## Methodology

This section describes the methodology used in the research or analysis.

- Data collection process
- Analysis techniques
- Tools and frameworks used

### Data Sources

We collected data from various sources including:

1. Primary research
2. Secondary sources
3. Expert interviews

## Results

The results section presents the key findings from our analysis.

### Key Findings

- Finding 1: Lorem ipsum dolor sit amet
- Finding 2: Consectetur adipiscing elit
- Finding 3: Sed do eiusmod tempor incididunt

## Conclusion

In conclusion, this document has presented...

## References

1. Reference One
2. Reference Two
3. Reference Three`,
		sections: [],
	},
	{
		id: "doc-2",
		title: "Meeting Notes.md",
		type: "document",
		inScope: true,
		createdAt: new Date("2024-01-18"),
		updatedAt: new Date("2024-01-18"),
		content: `# Meeting Notes - Q4 Planning

## Attendees
- John Smith (Product)
- Jane Doe (Engineering)
- Bob Wilson (Design)

## Action Items

### Q4 Goals
- Launch new feature set
- Improve performance by 30%
- Expand to new markets

## Discussion Points

The team discussed various strategies for achieving our Q4 objectives...`,
		sections: [],
	},
	{
		id: "doc-3",
		title: "Design Guidelines.pdf",
		type: "document",
		inScope: true,
		createdAt: new Date("2024-01-10"),
		updatedAt: new Date("2024-01-22"),
		content: `# Design Guidelines

## Typography

### Font Selection
We use a combination of serif and sans-serif fonts to create visual hierarchy.

### Size Guidelines
- Headings: 24-48px
- Body text: 16px
- Captions: 14px

## Color Palette

### Primary Colors
- Blue: #0066CC
- Green: #00AA44

### Accessibility Standards
All color combinations must meet WCAG 2.1 AA standards.`,
		sections: [],
	},
];

const sections: Section[] = [
	{
		id: "sec-1-1",
		title: "Introduction",
		type: "section",
		inScope: true,
		documentId: "doc-1",
		content: "This is the introduction section content...",
		frames: [],
	},
	{
		id: "sec-1-2",
		title: "Methodology",
		type: "section",
		inScope: true,
		documentId: "doc-1",
		content: "This section describes the methodology...",
		frames: [],
	},
	{
		id: "sec-1-3",
		title: "Results",
		type: "section",
		inScope: true,
		documentId: "doc-1",
		content: "The results section presents findings...",
		frames: [],
	},
	{
		id: "sec-2-1",
		title: "Action Items",
		type: "section",
		inScope: true,
		documentId: "doc-2",
		content: "Key action items from the meeting...",
		frames: [],
	},
	{
		id: "sec-3-1",
		title: "Typography",
		type: "section",
		inScope: true,
		documentId: "doc-3",
		content: "Typography guidelines and standards...",
		frames: [],
	},
	{
		id: "sec-3-2",
		title: "Color Palette",
		type: "section",
		inScope: true,
		documentId: "doc-3",
		content: "Color palette specifications...",
		frames: [],
	},
];

const frames: Frame[] = [
	{
		id: "frame-1-1-1",
		title: "AI Impact on Society",
		type: "concept",
		inScope: true,
		sectionId: "sec-1-1",
		content: "Analysis of AI impact on modern society...",
		relatedFrames: ["frame-1-2-1", "frame-1-3-1"],
	},
	{
		id: "frame-1-1-2",
		title: "Historical Context",
		type: "fact",
		inScope: true,
		sectionId: "sec-1-1",
		content: "Historical development of AI technologies...",
		relatedFrames: ["frame-1-1-1"],
	},
	{
		id: "frame-1-2-1",
		title: "Data Collection Process",
		type: "relationship",
		inScope: false,
		sectionId: "sec-1-2",
		content: "Detailed data collection methodology...",
		relatedFrames: ["frame-1-3-1"],
	},
	{
		id: "frame-1-3-1",
		title: "Key Findings",
		type: "claim",
		inScope: true,
		sectionId: "sec-1-3",
		content: "Primary research findings and conclusions...",
		relatedFrames: ["frame-1-1-1", "frame-1-2-1"],
	},
	{
		id: "frame-1-3-2",
		title: "Statistical Analysis",
		type: "fact",
		inScope: true,
		sectionId: "sec-1-3",
		content: "Statistical analysis results...",
		relatedFrames: ["frame-1-3-1"],
	},
	{
		id: "frame-2-1-1",
		title: "Q4 Goals",
		type: "claim",
		inScope: true,
		sectionId: "sec-2-1",
		content: "Quarterly goals and objectives...",
		relatedFrames: [],
	},
	{
		id: "frame-3-1-1",
		title: "Font Selection",
		type: "concept",
		inScope: true,
		sectionId: "sec-3-1",
		content: "Guidelines for font selection...",
		relatedFrames: ["frame-3-1-2"],
	},
	{
		id: "frame-3-1-2",
		title: "Size Guidelines",
		type: "fact",
		inScope: true,
		sectionId: "sec-3-1",
		content: "Specific size recommendations...",
		relatedFrames: ["frame-3-1-1"],
	},
	{
		id: "frame-3-2-1",
		title: "Primary Colors",
		type: "concept",
		inScope: true,
		sectionId: "sec-3-2",
		content: "Primary color definitions...",
		relatedFrames: ["frame-3-2-2"],
	},
	{
		id: "frame-3-2-2",
		title: "Accessibility Standards",
		type: "fact",
		inScope: true,
		sectionId: "sec-3-2",
		content: "WCAG compliance requirements...",
		relatedFrames: ["frame-3-2-1"],
	},
];

// Initialize relationships
documents.forEach((doc) => {
	doc.sections = sections.filter((s) => s.documentId === doc.id);
});

sections.forEach((sec) => {
	sec.frames = frames.filter((f) => f.sectionId === sec.id);
});

// Sessions data
const sessions: Session[] = [
	{
		id: "session-1",
		title: "Implementing file upload",
		timestamp: new Date(),
		preview: "How to implement drag and drop file upload with progress?",
		messageCount: 12,
		messages: [],
	},
	{
		id: "session-2",
		title: "State management patterns",
		timestamp: new Date(Date.now() - 86_400_000),
		preview: "What's the best way to handle global state in Next.js?",
		messageCount: 8,
		messages: [],
	},
	{
		id: "session-3",
		title: "Performance optimization",
		timestamp: new Date(Date.now() - 172_800_000),
		preview: "How do I optimize bundle size and loading performance?",
		messageCount: 15,
		messages: [],
	},
];

export class MockApiService {
	// Simulate network delay
	private delay(ms = 300): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	async getDocuments(): Promise<Document[]> {
		await this.delay();
		return documents;
	}

	async getDocument(id: string): Promise<Document | null> {
		await this.delay();
		return documents.find((d) => d.id === id) || null;
	}

	async getSection(id: string): Promise<Section | null> {
		await this.delay();
		return sections.find((s) => s.id === id) || null;
	}

	async getFrame(id: string): Promise<Frame | null> {
		await this.delay();
		return frames.find((f) => f.id === id) || null;
	}

	async getSessions(): Promise<Session[]> {
		await this.delay();
		return sessions;
	}

	async getRelatedItems(
		itemId: string,
		itemType: "document" | "section" | "frame" | "query",
	): Promise<RelatedItem[]> {
		await this.delay(500); // Slightly longer delay for "AI processing"

		const relatedItems: RelatedItem[] = [];

		if (itemType === "frame") {
			// Extract the title from the ID (e.g., "frame-AI Impact on Society" -> "AI Impact on Society")
			const frameTitle = itemId.startsWith("frame-")
				? itemId.substring(6)
				: itemId;
			const frame = frames.find(
				(f) => f.title === frameTitle || f.id === itemId,
			);

			if (frame?.relatedFrames) {
				frame.relatedFrames.forEach((relatedId, index) => {
					const relatedFrame = frames.find((f) => f.id === relatedId);
					if (relatedFrame) {
						relatedItems.push({
							id: relatedFrame.id,
							title: relatedFrame.title,
							type: "frame",
							relevanceScore: 0.8 + Math.random() * 0.2,
							preview: `${relatedFrame.content?.substring(0, 100)}...`,
							frameType: relatedFrame.type,
							wasUsedInContext: index === 0, // First related frame was used
						});
					}
				});
			}

			// Add parent section
			const section = sections.find((s) => s.id === frame?.sectionId);
			if (section) {
				relatedItems.push({
					id: section.id,
					title: section.title,
					type: "section",
					relevanceScore: 0.7,
					preview: `${section.content?.substring(0, 100)}...`,
					wasUsedInContext: true, // Parent section was used
				});
			}
		} else if (itemType === "section") {
			// Extract the title from the ID (e.g., "section-Introduction" -> "Introduction")
			const sectionTitle = itemId.startsWith("section-")
				? itemId.substring(8)
				: itemId;
			const section = sections.find(
				(s) => s.title === sectionTitle || s.id === itemId,
			);

			if (section) {
				section.frames.forEach((frame, index) => {
					relatedItems.push({
						id: frame.id,
						title: frame.title,
						type: "frame",
						relevanceScore: 0.9,
						preview: `${frame.content?.substring(0, 100)}...`,
						frameType: frame.type,
						wasUsedInContext: index < 2, // First two frames were used
					});
				});

				// Add parent document
				const doc = documents.find((d) => d.id === section.documentId);
				if (doc) {
					relatedItems.push({
						id: doc.id,
						title: doc.title,
						type: "document",
						relevanceScore: 0.6,
						preview: `${doc.content?.substring(0, 100)}...`,
						wasUsedInContext: true, // Parent document was used
					});
				}
			}
		} else if (itemType === "document") {
			// Extract the title from the ID (e.g., "doc-Research Paper.pdf" -> "Research Paper.pdf")
			const docTitle = itemId.startsWith("doc-") ? itemId.substring(4) : itemId;
			const doc = documents.find(
				(d) => d.title === docTitle || d.id === itemId,
			);

			if (doc) {
				doc.sections.forEach((section, index) => {
					relatedItems.push({
						id: section.id,
						title: section.title,
						type: "section",
						relevanceScore: 0.85,
						preview: `${section.content?.substring(0, 100)}...`,
						wasUsedInContext: index === 0, // Only first section was used
					});
				});
			}
		} else if (itemType === "query") {
			// For queries, return a mix of relevant items based on keywords
			// This is a simple mock - in reality this would use semantic search
			const queryKeywords = itemId.toLowerCase().split(" ");

			// Search through all content
			const allItems = ([] as (Document | Section | Frame)[]).concat(
				documents,
				sections,
				frames,
			);
			allItems.forEach((item, index) => {
				const content = `${item.title} ${item.content || ""}`.toLowerCase();
				const matches = queryKeywords.filter((keyword) =>
					content.includes(keyword),
				).length;

				if (matches > 0) {
					relatedItems.push({
						id: item.id,
						title: item.title,
						type: item.type as "document" | "section" | "frame",
						relevanceScore: matches / queryKeywords.length,
						preview: `${item.content?.substring(0, 100)}...`,
						frameType:
							"type" in item &&
							item.type !== "document" &&
							item.type !== "section"
								? (item as Frame).type
								: undefined,
						wasUsedInContext: matches >= 2 || index < 3, // Items with multiple matches or top 3 were used
					});
				}
			});
		}

		// Sort by relevance score
		return relatedItems
			.sort((a, b) => b.relevanceScore - a.relevanceScore)
			.slice(0, 10);
	}

	async getMarkdownContent(itemId: string): Promise<string | null> {
		await this.delay();

		// Infer type from itemId prefix or search in all collections
		if (itemId.startsWith("doc-")) {
			const docTitle = itemId.substring(4);
			const doc = documents.find(
				(d) => d.title === docTitle || d.id === itemId,
			);
			return doc?.content || null;
		}
		if (itemId.startsWith("section-")) {
			const sectionTitle = itemId.substring(8);
			const section = sections.find(
				(s) => s.title === sectionTitle || s.id === itemId,
			);
			if (section) {
				return `## ${section.title}\n\n${section.content || "No content available."}`;
			}
		} else if (itemId.startsWith("frame-")) {
			const frameTitle = itemId.substring(6);
			const frame = frames.find(
				(f) => f.title === frameTitle || f.id === itemId,
			);
			if (frame) {
				return `### ${frame.title}\n\n**Type**: ${frame.type}\n\n${frame.content || "No content available."}`;
			}
		} else {
			// For raw IDs without prefix, search all collections
			const doc = documents.find((d) => d.id === itemId);
			if (doc) {
				return doc.content || null;
			}

			const section = sections.find((s) => s.id === itemId);
			if (section) {
				return `## ${section.title}\n\n${section.content || "No content available."}`;
			}

			const frame = frames.find((f) => f.id === itemId);
			if (frame) {
				return `### ${frame.title}\n\n**Type**: ${frame.type}\n\n${frame.content || "No content available."}`;
			}
		}

		return null;
	}
}

export const mockApi = new MockApiService();
