## 2025-11-21T06:48:59Z

### Context
Need a `TextTransitionNew` component that highlights textual diffs with width-aware animations, typing/blur effects, and multi-line staggering for the FAQ hero copy. Research focuses on proven animation techniques, measuring rendered token sizes, and line-aware text splitting patterns that work with Framer Motion.

### Queries (External Research - Extract/Expand)
- "framer motion text transition animation measure text width using ResizeObserver"
- "Framer Motion animate width auto text measurement ResizeObserver example"
- "CSS-Tricks measure text width by creating hidden span"
- "Element.getBoundingClientRect() - Web APIs | MDN"

### Sources (External)
1. Animating Words and Letters with Framer Motion — Simply UI (https://www.simplyui.io/components/text-animation) (accessed: 2025-11-21T06:50:00Z)
   - Framer Motion handles per-character opacity/blur transitions with staggered delays; recommends composing typing-like effects with `motion.span` and filter animations.
2. splitText — Motion.dev Docs (https://motion.dev/docs/split-text) (accessed: 2025-11-21T06:51:12Z)
   - Demonstrates splitting strings into characters/words/lines for staggered timelines, highlighting line-by-line control to keep multi-line text aligned during animations.
3. Element: getBoundingClientRect() — MDN Web Docs (https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) (accessed: 2025-11-21T06:53:44Z)
   - Confirms `getBoundingClientRect()` returns the rendered size of an element, enabling accurate width measurement for any font/weight without estimation.

### Extracted Practices
- Use Framer Motion spans with opacity + blur transitions to reveal characters sequentially, mirroring typing (Source 1).
- Split copy into structural units (characters, words, lines) so animations can stagger at both token and line granularity (Source 2).
- Measure rendered dimensions with hidden DOM nodes and `getBoundingClientRect()` to drive width animations that respect typography (Source 3).

### Internal Mapping
- Reviewed `docs/context/text-transition-animation.md` for legacy tokenization + diffing behavior.
- Studied `packages/ui/src/components/text-transition.tsx`, which already tokenizes, measures widths via hidden spans, and diff-staggers inserts.
- Observed current component lacks multi-line awareness, per-character typed reveal, and explicit control over trailing token repositioning demanded by new requirements.

### Evaluation
- Context is sufficient to proceed; need to extend existing techniques with line grouping + typed animation pipeline.
- Confidence: 0.74 (some experimentation required, but foundations are solid).
- Open questions: best way to segment lines without layout thrash? Likely rely on `ResizeObserver`/`Range` measurement plus manual line-breaking container.

### Synthesis
Combine existing token diff logic with Motion.dev-style split lines: track per-line arrays, animate line groups with delays, and inside each changed token, drive typed animation using per-character spans inspired by Simply UI. Use MDN-backed measurement to animate placeholder gaps from previous width to new width, giving the "rubber band" feel.

### Proposed Actions
- Build `TextTransitionNew` in `packages/ui` using hidden measurement spans + `getBoundingClientRect`.
- Extend diff output with line metadata for staggered transitions.
- Implement typed reveal for changed tokens (opacity + blur).
- Integrate component on FAQ hero text with sample variations.

### Proposed Changes
- None yet; monitor whether this approach warrants new Cursor rule entries for animation patterns after implementation feedback.

