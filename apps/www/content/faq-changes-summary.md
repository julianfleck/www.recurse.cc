# FAQ Rework Summary - November 28, 2025

## Changes Implemented

### 1. Core Concepts Section - Reordered & Improved

**Reordered for better learning flow:**
1. What is RAGE? (foundational)
2. What are Frames? (building blocks)
3. What does "recursive" mean? (mechanism)
4. Why structure over similarity? (differentiation)
5. What is "rehydration"? (advanced)

**Headline Improvements:**
- ❌ "How does structure over similarity work?" → ✅ "Why does Recurse focus on structure instead of just similarity?"
- ❌ 'What do you mean by "recursive"?' → ✅ 'What does "recursive" mean in Recurse?'

**Content Improvements:**
- **Recursive:** Added "Ideas nest inside ideas, just like in real thinking" for clarity
- **Structure over similarity:** Completely rewritten for uninitiated users—explains what similarity search does, then contrasts with structural approach
- **Rehydration:** Expanded to explain it's about learning from own reasoning, not just "closing the loop"

### 2. Features Section - Better Grouping & Enhanced Content

**Reordered by importance:**
1. Adaptive Schemas (core processing)
2. Temporal Versioning (core processing)
3. Source Subscriptions (continuous knowledge)
4. Context Streams (continuous knowledge)
5. Can I create my own Context Stream?
6. Search capabilities
7. How do I organize my knowledge? (formerly "What are Scopes?")
8. Automatic context persistence

**Headline Improvements:**
- ❌ "What are Scopes?" → ✅ "How do I organize my knowledge?"

**Content Enhancements:**
- **Adaptive Schemas:** Added concrete examples (research papers → Claim/Evidence, meetings → Decisions, bugs → Problem/Solution)
- **Temporal Versioning:** Added "living memory substrate" framing from docs, emphasized the learning aspect
- **Source Subscriptions:** Emphasized automatic evolution vs. duplicates, added Temporal Versioning connection
- **Context Streams:** Added "trust and authority" emphasis from docs
- **Create your own stream:** Added "You're not creating new content—you're just making what you've already built accessible"
- **Scopes:** Rewrote with concrete example of keeping personal vs. work separate

### 3. Getting Started Section - Added Beta Info & File Formats

**Added new items:**
1. **"How do I join the beta?"** (NEW - from old snippets)
   - Public beta access at dashboard.recurse.cc
   - Mentions grandfathered pricing
   - Links to BYOK requirement

2. **"What file formats are supported?"** (MOVED from Technical Details)
   - Better placement for new users
   - Simplified technical details for readability

**Reordered:**
1. How to join beta (first step)
2. How to get started (overview)
3. Installation requirements
4. BYOK explanation
5. File formats supported
6. Processing time

### 4. Integration Section - Logical Flow

**Reordered for better learning:**
1. What's the difference? (overview first)
2. How does Proxy work? (detail the main approach)
3. Can I use multiple together? (after both explained)
4. Provider compatibility questions
5. Advanced use cases (multi-agent, retrieval-only)

**Removed:**
- "Is this just for text?" - Redundant with file formats in Getting Started

### 5. Technical Details Section

**No major changes needed** - already well-structured

**Removed:**
- "What file formats are supported?" - Moved to Getting Started

### 6. Comparison Section

**No changes** - already excellent

### 7. Misc Section

**No changes** - already good

---

## Key Improvements

### Accessibility for Uninitiated Users
- Headlines now use plain language instead of jargon
- Answers start with relatable explanations before diving into technical details
- Added concrete examples throughout

### Better Information Architecture
- General → Specific ordering within each section
- Related items grouped together
- Core concepts before advanced features

### Alignment with Concept Docs
- Incorporated "living memory substrate" framing
- Emphasized "trust and authority" for Context Streams
- Added "emergent structure" language for Adaptive Schemas
- Strengthened temporal versioning explanations

### Content Quality
- Removed redundancy (file formats moved once, not duplicated)
- Added practical examples (personal vs. work scopes)
- Strengthened differentiation (structure vs. similarity)

---

## Items NOT Included (From Old Snippets)

**Skipped because they belong elsewhere:**
- Upload troubleshooting → Should be in docs/support
- Search troubleshooting → Should be in docs/support
- API authentication details → Should be in API docs
- Rate limits → Should be in API docs
- Billing/pricing details → Should be on pricing page
- Depth parameter explanation → Too technical for FAQ
- Webhook setup → Should be in integration guides

**These should live in proper documentation, not FAQ.**

---

## Recommendations for Next Steps

1. **Review the old commented snippets** - Some contain useful detail that could enhance docs:
   - Upload troubleshooting → Create troubleshooting guide
   - Search depth explanation → Add to API docs
   - Webhook setup → Add to integration guides

2. **Consider adding:**
   - "What happens to my data?" (privacy/security)
   - "Can I export my knowledge graph?" (data portability)
   - "How do I delete content?" (data management)

3. **Monitor user questions** - Add FAQs based on actual support inquiries

---

## Files Modified

- `/Users/julian/Tresors/Privat/Code/writing/projects/recurse/www/content/faq.ts`

## Files Created (Documentation)

- `/Users/julian/Tresors/Privat/Code/writing/projects/recurse/www/content/faq-review-2025-11-28.md` (analysis)
- `/Users/julian/Tresors/Privat/Code/writing/projects/recurse/www/content/faq-changes-summary.md` (this file)

