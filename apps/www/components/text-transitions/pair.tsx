"use client"

import { motion } from "motion/react"
import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@recurse/ui/lib/utils"

interface TextTransitionPairProps extends React.HTMLAttributes<HTMLSpanElement> {
  fromText: string
  toText: string
  durationMs?: number
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
  afterIndex: number // -1 means before first token in OLD sequence
  targetWidth: number
  startNew: number // index in NEW parts where insertion starts
  items: string[]
}

export function TextTransitionPair({
  fromText,
  toText,
  className,
  durationMs = 1200,
  ...props
}: TextTransitionPairProps) {
  const containerRef = useRef<HTMLSpanElement | null>(null)
  const idCounter = useRef(0)

  const [tokens, setTokens] = useState<Token[]>(() => tokenize(fromText))
  const [spacers, setSpacers] = useState<Spacer[]>([])

  const duration = durationMs / 1000

  useEffect(() => {
    setTokens(tokenize(fromText))
    setSpacers([])
    runDiffAnimation(fromText, toText)
  }, [fromText, toText, durationMs])

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

  // Ensure at least one space between adjacent non-space tokens if missing
  function renderItemsToText(items: string[]): string {
    let out = ""
    let prevWasWord = false
    for (const part of items) {
      const isSpace = /^\s+$/.test(part)
      if (isSpace) {
        out += part
        prevWasWord = false
      } else {
        if (prevWasWord && !out.endsWith(" ")) out += " "
        out += part
        prevWasWord = true
      }
    }
    return out
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

  function runDiffAnimation(from: string, to: string) {
    const nextParts = to.split(/(\s+)/)

    const nextSet = new Set(
      nextParts.filter(p => !/^\s+$/.test(p)).map(p => p.toLowerCase())
    )
    setTokens(tokenize(from).map(t => {
      if (t.isSpace) return t
      if (nextSet.has(t.normalized)) return { ...t, state: "shared" }
      return { ...t, state: "removed" }
    }))

    const oldParts = from.split(/(\s+)/)
    const ops = lcsDiff(oldParts, nextParts)

    const byBoundary = new Map<number, Spacer>()
    let spacerSeq = 0

    ops.forEach((op) => {
      if (op.type === "insert") {
        const afterIndex = op.startOld - 1
        const existing = byBoundary.get(afterIndex)
        const plain = renderItemsToText(op.items)
        const segWidth = measureTextWidth(plain + " ")
        if (existing) {
          existing.targetWidth += segWidth
          existing.items.push(...op.items)
        } else {
          byBoundary.set(afterIndex, {
            id: spacerSeq++,
            afterIndex,
            targetWidth: segWidth,
            startNew: op.startNew,
            items: [...op.items],
          })
        }
      }
    })

    setSpacers(Array.from(byBoundary.values()))
  }

  // Group consecutive removed tokens (with following spaces) until next non-removed token
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
          if (next.state === "removed" || next.isSpace) { j++; continue }
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

  const overflowStyle = { display: "inline-block", overflowX: "visible" as const, overflowY: "visible" as const, paddingBottom: "0.08em", verticalAlign: "baseline" as const }

  return (
    <span
      ref={containerRef}
      className={cn("inline-flex flex-wrap text-current", className)}
      aria-live="polite"
      style={{ wordSpacing: "normal" }}
      {...props}
    >
      <span className="inline-flex flex-wrap items-baseline" aria-hidden="true">
        {spacers.filter(s => s.afterIndex === -1).map((s, sIndex) => {
          const text = renderItemsToText(s.items)
          return (
            <motion.span
              key={`spacer-open-${s.id}`}
              className="inline-block"
              initial={{ width: 0 }}
              animate={{ width: s.targetWidth }}
              transition={{ duration: duration * 0.5, ease: "easeInOut", delay: sIndex * 0.1 }}
              style={overflowStyle}
            >
              <motion.span
                className="inline-block whitespace-pre"
                style={{ lineHeight: "inherit" }}
              >
                {text.split("").map((char, charIndex) => (
                  <motion.span
                    key={`char-${charIndex}`}
                    initial={{ opacity: 0, filter: "blur(4px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    transition={{
                      duration: duration * 0.5,
                      delay: (sIndex * 0.1) + (charIndex * 0.05) + 0.2,
                      ease: "easeInOut"
                    }}
                    className="inline-block"
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.span>
            </motion.span>
          )
        })}

        {renderNodes.map((node, nodeIndex) => {
          const currentDelay = (spacers.filter(s => s.afterIndex === -1).length + nodeIndex) * 0.1

          if (node.kind === "group-removed") {
            const groupTokens = tokens.slice(node.start, node.end + 1)
            const regionSpacers = spacers.filter(s => s.afterIndex >= node.start && s.afterIndex <= node.end)
            const regionText = renderItemsToText(regionSpacers.flatMap(s => s.items))
            const regionWidth = regionText ? measureTextWidth(regionText + " ") : 0
            return (
              <span key={node.key} className="inline-flex items-baseline">
                {regionWidth > 0 && (
                  <motion.span
                    key={`spacer-region-${node.key}`}
                    className="inline-block"
                    initial={{ width: 0 }}
                    animate={{ width: regionWidth }}
                    transition={{ duration: duration * 0.5, ease: "easeInOut", delay: currentDelay }}
                    style={overflowStyle}
                  >
                    <motion.span
                      className="inline-block whitespace-pre"
                      style={{ lineHeight: "inherit" }}
                    >
                      {regionText.split("").map((char, charIndex) => (
                        <motion.span
                          key={`char-${charIndex}`}
                          initial={{ opacity: 0, filter: "blur(4px)" }}
                          animate={{ opacity: 1, filter: "blur(0px)" }}
                          transition={{
                            duration: duration * 0.5,
                            delay: currentDelay + (charIndex * 0.05) + 0.2,
                            ease: "easeInOut"
                          }}
                          className="inline-block"
                        >
                          {char}
                        </motion.span>
                      ))}
                    </motion.span>
                  </motion.span>
                )}
                <motion.span
                  className="inline-flex items-baseline justify-center"
                  animate={{ opacity: 0, filter: "blur(4px)", width: 0 }}
                  transition={{
                    width: { duration: duration * 0.5, ease: "easeInOut", delay: currentDelay },
                    opacity: { duration: duration * 0.4, delay: currentDelay },
                    filter: { duration: duration * 0.4, delay: currentDelay }
                  }}
                  style={{ display: "inline-flex", overflowX: "hidden", overflowY: "visible", paddingBottom: "0.08em" }}
                >
                  {groupTokens.map((gt) => (
                    <span key={gt.id} className="inline-block whitespace-pre">{gt.content}</span>
                  ))}
                </motion.span>
              </span>
            )
          }

          const idx = node.index
          const t = tokens[idx]
          return (
            <span key={`wrap-${t.id}`} className="inline-flex items-baseline">
              {t.state === "shared" ? (
                <motion.span className="inline-block whitespace-pre" style={{ color: "#ef4444" }}>
                  {t.content}
                </motion.span>
              ) : (
                <motion.span className="inline-block whitespace-pre">{t.content}</motion.span>
              )}

              {spacers.filter(s => s.afterIndex === idx).map((s, sIndex) => {
                const text = renderItemsToText(s.items)
                return (
                  <motion.span
                    key={`spacer-open-${s.id}`}
                    className="inline-block"
                    initial={{ width: 0 }}
                    animate={{ width: s.targetWidth }}
                    transition={{ duration: duration * 0.5, ease: "easeInOut", delay: currentDelay + (sIndex * 0.1) }}
                    style={overflowStyle}
                  >
                    <motion.span
                      className="inline-block whitespace-pre"
                      style={{ lineHeight: "inherit" }}
                    >
                      {text.split("").map((char, charIndex) => (
                        <motion.span
                          key={`char-${charIndex}`}
                          initial={{ opacity: 0, filter: "blur(4px)" }}
                          animate={{ opacity: 1, filter: "blur(0px)" }}
                          transition={{
                            duration: duration * 0.5,
                            delay: currentDelay + (sIndex * 0.1) + (charIndex * 0.05) + 0.2,
                            ease: "easeInOut"
                          }}
                          className="inline-block"
                        >
                          {char}
                        </motion.span>
                      ))}
                    </motion.span>
                  </motion.span>
                )
              })}
            </span>
          )
        })}
      </span>
    </span>
  )
}

TextTransitionPair.displayName = "TextTransitionPair"
