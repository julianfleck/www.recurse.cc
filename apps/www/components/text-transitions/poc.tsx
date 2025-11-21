"use client"

import { motion } from "motion/react"
import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@recurse/ui/lib/utils"

interface TextTransitionProps extends React.HTMLAttributes<HTMLSpanElement> {
  text?: string
  texts?: string[]
  interval?: number
}

interface Token {
  id: number
  content: string
  isSpace: boolean
  normalized: string
  state: "default" | "shared" | "removed" | "appearing"
  appearWidth?: number
}

interface Spacer {
  id: number
  afterIndex: number // -1 means before first token (relative to OLD tokens)
  targetWidth: number
  startNew: number // index in NEW parts where insertion starts
}

interface ClosingSpacer {
  id: number
  beforeIndex: number // index in NEW tokens before which the spacer sits
  startWidth: number
}

export function TextTransitionPOC({
  text,
  texts,
  className,
  interval = 5200,
  ...props
}: TextTransitionProps) {
  const resolvedTexts = useMemo(() => {
    if (texts && texts.length > 0) return texts
    return text ? [text] : [""]
  }, [text, texts])

  const [activeIndex, setActiveIndex] = useState(0)
  const displayedText = useRef(resolvedTexts[0] ?? "")
  const idCounter = useRef(0)
  const [tokens, setTokens] = useState<Token[]>(() => tokenize(displayedText.current))
  const [spacers, setSpacers] = useState<Spacer[]>([])
  const [closingSpacers, setClosingSpacers] = useState<ClosingSpacer[]>([])
  const swapTimeout = useRef<number | null>(null)
  const cycleTimeout = useRef<number | null>(null)
  const finalizeTimeout = useRef<number | null>(null)
  const containerRef = useRef<HTMLSpanElement | null>(null)
  const [isMerging, setIsMerging] = useState(false)

  // Cycle timer
  useEffect(() => {
    if (resolvedTexts.length <= 1) return

    if (cycleTimeout.current) window.clearTimeout(cycleTimeout.current)

    cycleTimeout.current = window.setTimeout(() => {
      const nextIndex = (activeIndex + 1) % resolvedTexts.length
      const nextText = resolvedTexts[nextIndex] ?? ""

      // 1) Diff current tokens vs next AND prepare spacers
      runDiffAnimation(nextText)

      // 2) After fade-out completes, merge into the next state reusing shared tokens
      const swapDelayMs = 2000
      if (swapTimeout.current) window.clearTimeout(swapTimeout.current)
      swapTimeout.current = window.setTimeout(() => {
        mergeIntoNext(nextText)
        displayedText.current = nextText
        setActiveIndex(nextIndex)
      }, swapDelayMs)
    }, interval)

    return () => {
      if (cycleTimeout.current) window.clearTimeout(cycleTimeout.current)
      if (swapTimeout.current) window.clearTimeout(swapTimeout.current)
    }
  }, [resolvedTexts, interval, activeIndex])

  function tokenize(input: string): Token[] {
    const parts = input.split(/(\s+)/)
    return parts.map((part) => {
      const isSpace = /^\s+$/.test(part)
      const normalized = isSpace ? part : part.toLowerCase()
      return {
        id: idCounter.current++,
        content: part,
        isSpace,
        normalized,
        state: "default" as const,
      }
    })
  }

  function measureTextWidth(text: string): number {
    if (typeof document === "undefined") return text.length * 12
    const el = document.createElement("span")
    el.style.visibility = "hidden"
    el.style.position = "absolute"
    el.style.whiteSpace = "pre"
    if (containerRef.current) {
      const cs = window.getComputedStyle(containerRef.current)
      if ((cs as any).font) (el.style as any).font = (cs as any).font
      if (cs.letterSpacing) el.style.letterSpacing = cs.letterSpacing
      if (cs.wordSpacing) el.style.wordSpacing = cs.wordSpacing
    }
    el.textContent = text
    document.body.appendChild(el)
    const width = el.offsetWidth
    document.body.removeChild(el)
    return width
  }

  type Op = { type: "equal" | "delete" | "insert"; items: string[]; startOld: number; startNew: number }

  function lcsDiff(oldArr: string[], newArr: string[]): Op[] {
    const m = oldArr.length
    const n = newArr.length
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
    for (let i = m - 1; i >= 0; i--) {
      for (let j = n - 1; j >= 0; j--) {
        if (oldArr[i] === newArr[j]) dp[i][j] = dp[i + 1][j + 1] + 1
        else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1])
      }
    }
    const ops: Op[] = []
    let i = 0
    let j = 0
    while (i < m && j < n) {
      if (oldArr[i] === newArr[j]) {
        const startOld = i
        const startNew = j
        const items: string[] = []
        while (i < m && j < n && oldArr[i] === newArr[j]) {
          items.push(oldArr[i])
          i++
          j++
        }
        ops.push({ type: "equal", items, startOld, startNew })
      } else if (dp[i + 1][j] >= dp[i][j + 1]) {
        const startOld = i
        const items: string[] = [oldArr[i]]
        i++
        while (i < m && dp[i + 1]?.[j] >= dp[i]?.[j + 1]) {
          items.push(oldArr[i])
          i++
        }
        ops.push({ type: "delete", items, startOld, startNew: j })
      } else {
        const startNew = j
        const items: string[] = [newArr[j]]
        j++
        while (j < n && dp[i + 1]?.[j] < dp[i]?.[j + 1]) {
          items.push(newArr[j])
          j++
        }
        ops.push({ type: "insert", items, startOld: i, startNew })
      }
    }
    if (i < m) ops.push({ type: "delete", items: oldArr.slice(i), startOld: i, startNew: j })
    if (j < n) ops.push({ type: "insert", items: newArr.slice(j), startOld: i, startNew: j })
    return ops
  }

  function runDiffAnimation(nextText: string) {
    const nextParts = nextText.split(/(\s+)/)

    // 1) Tag tokens shared vs removed
    const nextSet = new Set(
      nextParts.filter(p => !/^\s+$/.test(p)).map(p => p.toLowerCase())
    )
    setTokens((prev) => prev.map(t => {
      if (t.isSpace) return t
      if (nextSet.has(t.normalized)) return { ...t, state: "shared" }
      return { ...t, state: "removed" }
    }))

    // 2) Compute insertion slots via LCS and create spacers with target widths
    const oldParts = tokens.map(t => t.content)
    const ops = lcsDiff(oldParts, nextParts)

    const newSpacers: Spacer[] = []
    let spacerId = 0

    ops.forEach((op) => {
      if (op.type === "insert") {
        const targetWidth = op.items.reduce((sum, item) => sum + measureTextWidth(item), 0)
        const afterIndex = op.startOld - 1
        newSpacers.push({ id: spacerId++, afterIndex, targetWidth, startNew: op.startNew })
      }
    })

    setSpacers(newSpacers)
  }

  function mergeIntoNext(nextText: string) {
    const nextParts = nextText.split(/(\s+)/)

    // LCS over FULL parts (including spaces) to get stable mapping
    const oldParts = tokens.map(t => t.content)
    const ops = lcsDiff(oldParts, nextParts)

    const nextTokens: Token[] = []

    // Helper to create new token (appearing for words, default for spaces)
    const createNewToken = (part: string): Token => {
      const isSpace = /^\s+$/.test(part)
      const normalized = isSpace ? part : part.toLowerCase()
      if (isSpace) {
        return {
          id: idCounter.current++,
          content: part,
          isSpace: true,
          normalized,
          state: "default",
        }
      }
      return {
        id: idCounter.current++,
        content: part,
        isSpace: false,
        normalized,
        state: "appearing",
        appearWidth: measureTextWidth(part),
      }
    }

    ops.forEach((op) => {
      if (op.type === "equal") {
        for (let k = 0; k < op.items.length; k++) {
          const oldIdx = op.startOld + k
          const reused = tokens[oldIdx]
          nextTokens.push({ ...reused })
        }
      } else if (op.type === "insert") {
        for (let k = 0; k < op.items.length; k++) {
          nextTokens.push(createNewToken(op.items[k]))
        }
      }
    })

    // Convert opening spacers to closing spacers placed before the insertion point in NEW tokens
    const newClosing: ClosingSpacer[] = spacers.map((s) => ({
      id: s.id,
      beforeIndex: Math.max(0, s.startNew),
      startWidth: s.targetWidth,
    }))

    setIsMerging(true)
    setClosingSpacers(newClosing)
    setSpacers([])
    setTokens(nextTokens)

    // Finalize: after animations, clear closing spacers and re-enable layout
    if (finalizeTimeout.current) window.clearTimeout(finalizeTimeout.current)
    finalizeTimeout.current = window.setTimeout(() => {
      setClosingSpacers([])
      setIsMerging(false)
    }, Math.round((duration + 0.1) * 1000))
  }

  const handleCopy = (e: React.ClipboardEvent) => {
    e.preventDefault()
    e.clipboardData?.setData("text/plain", displayedText.current)
  }

  // Slower debug timings
  const duration = 1.2

  // Group consecutive removed tokens (including adjacent spaces) until a shared token is encountered
  type RenderNode =
    | { kind: "group-removed"; start: number; end: number; key: string }
    | { kind: "single"; index: number }

  const renderNodes: RenderNode[] = useMemo(() => {
    const nodes: RenderNode[] = []
    let i = 0
    while (i < tokens.length) {
      const t = tokens[i]
      if (t.state === "removed") {
        let j = i
        while (j + 1 < tokens.length) {
          const next = tokens[j + 1]
          if (next.state === "removed" || next.isSpace) {
            j++
            continue
          }
          break
        }
        nodes.push({ kind: "group-removed", start: i, end: j, key: `grp-${tokens[i].id}-${tokens[j].id}` })
        i = j + 1
      } else {
        nodes.push({ kind: "single", index: i })
        i++
      }
    }
    return nodes
  }, [tokens])

  return (
    <span
      ref={containerRef}
      className={cn("inline-flex flex-wrap text-current", className)}
      aria-live="polite"
      onCopy={handleCopy}
      style={{ wordSpacing: "normal" }}
      {...props}
    >
      <span className="sr-only">{displayedText.current}</span>

      <span className="inline-flex flex-wrap items-baseline" aria-hidden="true">
        {/* Opening spacer before first token */}
        {spacers.filter(s => s.afterIndex === -1).map(s => (
          <motion.span
            key={`spacer-open-${s.id}`}
            className="inline-block"
            initial={{ width: 0 }}
            animate={{ width: s.targetWidth }}
            transition={{ duration }}
            style={{ display: "inline-block" }}
          />
        ))}

        {renderNodes.map((node) => {
          if (node.kind === "group-removed") {
            const groupTokens = tokens.slice(node.start, node.end + 1)
            const startIndex = node.start
            const endIndex = node.end
            return (
              <span key={node.key} className="inline-flex items-baseline">
                <motion.span
                  layout="position"
                  className="inline-flex items-baseline overflow-hidden"
                  animate={{ opacity: 0, filter: "blur(4px)", width: 0 }}
                  transition={{ duration }}
                  style={{ display: "inline-flex" }}
                >
                  {groupTokens.map((gt) => (
                    <span key={gt.id} className="inline-block whitespace-pre">{gt.content}</span>
                  ))}
                </motion.span>
                {/* Opening spacers for all insertion points inside this group */}
                {spacers
                  .filter(s => s.afterIndex >= startIndex && s.afterIndex <= endIndex)
                  .map(s => (
                    <motion.span
                      key={`spacer-open-${s.id}`}
                      className="inline-block"
                      initial={{ width: 0 }}
                      animate={{ width: s.targetWidth }}
                      transition={{ duration }}
                      style={{ display: "inline-block" }}
                    />
                  ))}
              </span>
            )
          }

          const idx = node.index
          const t = tokens[idx]
          return (
            <span key={`wrap-${t.id}`} className="inline-flex items-baseline">
              {/* Closing spacers that sit BEFORE this token after merge */}
              {closingSpacers.filter(cs => cs.beforeIndex === idx).map(cs => (
                <motion.span
                  key={`spacer-close-${cs.id}`}
                  className="inline-block"
                  initial={{ width: cs.startWidth }}
                  animate={{ width: 0 }}
                  transition={{ duration }}
                  style={{ display: "inline-block" }}
                />
              ))}

              {t.state === "shared" ? (
                <motion.span
                  layout={isMerging ? undefined : "position"}
                  key={t.id}
                  className="inline-block whitespace-pre"
                  style={{ color: "#ef4444" }}
                >
                  {t.content}
                </motion.span>
              ) : t.state === "appearing" ? (
                <motion.span
                  layout={isMerging ? undefined : "position"}
                  key={t.id}
                  className="inline-block whitespace-pre overflow-hidden"
                  initial={{ width: 0, opacity: 1 }}
                  animate={{ width: t.appearWidth ?? 0, opacity: 1 }}
                  transition={{ duration }}
                >
                  {t.content}
                </motion.span>
              ) : t.state === "removed" ? (
                <motion.span
                  layout={isMerging ? undefined : "position"}
                  key={t.id}
                  className="inline-block whitespace-pre"
                  animate={{ opacity: 0, filter: "blur(4px)", width: 0 }}
                  transition={{ duration }}
                  style={{ overflow: "hidden" }}
                >
                  {t.content}
                </motion.span>
              ) : (
                <motion.span layout={isMerging ? undefined : "position"} key={t.id} className="inline-block whitespace-pre">{t.content}</motion.span>
              )}

              {/* Opening spacers after this token boundary (pre-merge) */}
              {spacers.filter(s => s.afterIndex === idx).map(s => (
                <motion.span
                  key={`spacer-open-${s.id}`}
                  className="inline-block"
                  initial={{ width: 0 }}
                  animate={{ width: s.targetWidth }}
                  transition={{ duration }}
                  style={{ display: "inline-block" }}
                />
              ))}
            </span>
          )
        })}

        {/* Closing spacers at tail when insertion occurs at end */}
        {closingSpacers.filter(cs => cs.beforeIndex >= tokens.length).map(cs => (
          <motion.span
            key={`spacer-close-tail-${cs.id}`}
            className="inline-block"
            initial={{ width: cs.startWidth }}
            animate={{ width: 0 }}
            transition={{ duration }}
            style={{ display: "inline-block" }}
          />
        ))}
      </span>
    </span>
  )
}

TextTransitionPOC.displayName = "TextTransitionPOC"
