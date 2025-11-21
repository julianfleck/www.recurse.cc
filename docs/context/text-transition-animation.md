---
title: TextTransition Animation Notes
description: Behavior reference for the legacy marketing TextTransition effect
---

## Overview

The `TextTransition` animation cycles between arbitrary strings by diffing tokens, animating their widths, and applying progressive blur/fade effects. The original implementation (see `docs/context/TextTransition.jsx`) relies on token-aware comparisons so replacements retain spacing and rhythm.

## Animation Stages

1. **Tokenization**
   - Text splits on whitespace and punctuation via `/(\s+|[.,!?;:-])/`.
   - Each token records its type (`word`, `compound-word`, `punctuation`, `space`) and a normalized value for comparisons.

2. **Diffing**
   - Incoming tokens compare against prior ones by normalized form.
   - Matches receive `state: "same"`; unmatched tokens become `"added"`.
   - Consecutive `"added"` tokens group together so multi-word insertions animate as a block.

3. **Width Measurement**
   - Hidden off-screen spans measure the natural width of every token before animation.
   - A registry stores previous widths per token index, letting replacements animate from the old width to the new width.

4. **Framer Motion Animation**
   - Each token renders inside a `motion.span` with:
     - `initial`: reduced opacity/scale plus blur if new.
     - `animate`: target width, full opacity, blur reset.
     - `transition`: spring width easing (stiffer when shrinking) and stagger delays for grouped insertions.
   - Tokens preserve `white-space: pre` to keep original spacing; widths animate so spaces stretch/shrink smoothly.

5. **Progressive Blur & Cursor Effect**
   - Newly added tokens start blurred and sharpen as they settle.
   - Removed tokens fade via width collapse (handled implicitly when replacement width goes to zero).

This pipeline ensures the hero headline swaps feel like an intelligent rewrite instead of a jump cut: shared words stay anchored, additions grow in, and spacing adjusts organically.

