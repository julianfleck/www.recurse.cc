"use client"

import { motion } from "motion/react"
import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@recurse/ui/lib/utils"

interface TextSwapProps extends React.HTMLAttributes<HTMLSpanElement> {
  texts: string[]
  interval?: number
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

export function TextSwap({
  texts,
  className,
  interval = 3000,
  durationMs = 8200,
  ...props
}: TextSwapProps) {
  const containerRef = useRef<HTMLSpanElement | null>(null)
  const idCounter = useRef(0)
  const spacerIdCounter = useRef(0)

  const [currentTextObj, setCurrentTextObj] = useState({
    from: texts[0] || "",
    to: texts[0] || ""
  })

  const [tokens, setTokens] = useState<Token[]>(() => tokenize(texts[0] || ""))
  const [spacers, setSpacers] = useState<Spacer[]>([])

  // Top-level speed multiplier
  const baseSpeed = 0.4
  
  const duration = (durationMs / 1000) * baseSpeed

  useEffect(() => {
    if (!texts.length) return
    let currentIndex = 0
    
    const timer = setInterval(() => {
      const prevIndex = currentIndex
      currentIndex = (currentIndex + 1) % texts.length
      setCurrentTextObj({
        from: texts[prevIndex],
        to: texts[currentIndex]
      })
    }, interval)
    
    return () => clearInterval(timer)
  }, [texts, interval])

  useEffect(() => {
    setTokens(tokenize(currentTextObj.from))
    setSpacers([])
    runDiffAnimation(currentTextObj.from, currentTextObj.to)
  }, [currentTextObj, durationMs])

  useEffect(() => {
    const handleResize = () => {
      // Force re-calculation of widths by re-running the diff animation with current state
      runDiffAnimation(currentTextObj.from, currentTextObj.to)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [currentTextObj])

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

    const oldParts = from.split(/(\s+)/)
    // Map to initial tokens, default to 'removed'
    const initialTokens = tokenize(from).map(t => ({ ...t, state: "removed" as Token["state"] }))
    
    const ops = lcsDiff(oldParts, nextParts)
    
    // Mark shared tokens based on LCS 'equal' ops
    ops.forEach(op => {
      if (op.type === "equal") {
        for (let k = 0; k < op.items.length; k++) {
          const idx = op.startOld + k
          if (initialTokens[idx]) {
            initialTokens[idx].state = "shared"
          }
        }
      }
    })

    setTokens(initialTokens)

    // Instead of merging spacers by boundary, we simply collect all of them.
    // We break long insertions into smaller chunks (Word + optional Space) to allow wrapping.
    const allSpacers: Spacer[] = []

    ops.forEach((op) => {
      if (op.type === "insert") {
        const afterIndex = op.startOld - 1
        
        // Process items to create smaller spacers
        let currentItems: string[] = []
        
        for (const item of op.items) {
            const isSpace = /^\s+$/.test(item)
            if (isSpace) {
                // Append space to current word if exists, or treat as standalone if no word
                currentItems.push(item)
                // Commit this chunk
                const plain = renderItemsToText(currentItems)
                const segWidth = measureTextWidth(plain + (/\s$/.test(plain) ? "" : " "))
                allSpacers.push({
                  id: spacerIdCounter.current++,
                  afterIndex,
                  targetWidth: segWidth,
                  startNew: op.startNew,
                  items: [...currentItems],
                })
                currentItems = []
            } else {
                // It is a word
                if (currentItems.length > 0) {
                    // We had a word before without space? Commit previous chunk
                    const plain = renderItemsToText(currentItems)
                    const segWidth = measureTextWidth(plain + (/\s$/.test(plain) ? "" : " "))
                    allSpacers.push({
                      id: spacerIdCounter.current++,
                      afterIndex,
                      targetWidth: segWidth,
                      startNew: op.startNew,
                      items: [...currentItems],
                    })
                    currentItems = []
                }
                currentItems.push(item)
            }
        }
        // Flush remaining
        if (currentItems.length > 0) {
            const plain = renderItemsToText(currentItems)
            const segWidth = measureTextWidth(plain + (/\s$/.test(plain) ? "" : " "))
            allSpacers.push({
              id: spacerIdCounter.current++,
              afterIndex,
              targetWidth: segWidth,
              startNew: op.startNew,
              items: [...currentItems],
            })
        }
      }
    })

    setSpacers(allSpacers)
  }

  const overflowStyle = { display: "inline-block", overflowX: "visible" as const, overflowY: "visible" as const, paddingBottom: "0.08em", verticalAlign: "baseline" as const }

  const renderSpacer = (s: Spacer, baseDelay: number) => {
    const text = renderItemsToText(s.items)
    return (
      <motion.span
        key={`spacer-${s.id}`}
        className="inline-block"
        initial={{ width: 0 }}
        animate={{ width: s.targetWidth }}
        transition={{ duration: duration * 0.5, ease: "easeInOut", delay: baseDelay }}
        style={{ ...overflowStyle, width: 0 }}
      >
        <motion.span
          className="inline-block whitespace-pre hyphens-none"
          style={{ lineHeight: "inherit" }}
        >
          {text.split("").map((char, charIndex) => (
            <motion.span
              key={`char-${charIndex}`}
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{
                duration: duration * 0.3,
                delay: baseDelay + (charIndex * 0.05) + 0.2,
                ease: "easeInOut"
              }}
              className="inline-block"
              style={{ opacity: 0, filter: "blur(4px)" }}
            >
              {char}
            </motion.span>
          ))}
        </motion.span>
      </motion.span>
    )
  }

  // Flatten the render loop to allow wrapping
  const renderedElements: React.ReactNode[] = []
  let delayCounter = 0

  // 1. Initial Spacers (before any token)
  spacers.filter(s => s.afterIndex === -1).forEach((s) => {
    renderedElements.push(renderSpacer(s, delayCounter * 0.1))
    delayCounter++
  })

  // 2. Tokens and their following spacers
  tokens.forEach((t, i) => {
    const currentDelay = delayCounter * 0.1

    if (t.state === "removed") {
      renderedElements.push(
        <motion.span
          key={`token-rem-${t.id}`}
          className="inline-block whitespace-pre"
          initial={{ width: "auto" }}
          animate={{ opacity: 0, filter: "blur(4px)", width: 0 }}
          transition={{
            width: { duration: duration * 0.5, ease: "easeInOut", delay: currentDelay },
            opacity: { duration: duration * 0.4, delay: currentDelay },
            filter: { duration: duration * 0.4, delay: currentDelay }
          }}
          style={{ overflowX: "hidden", overflowY: "visible", paddingBottom: "0.08em" }}
        >
          {t.content}
        </motion.span>
      )
    } else {
      // Shared
      renderedElements.push(
        <motion.span key={`token-shared-${t.id}`} className="inline-block whitespace-pre">
          {t.content}
        </motion.span>
      )
    }
    
    delayCounter++

    // Spacers after this token
    spacers.filter(s => s.afterIndex === i).forEach((s) => {
      renderedElements.push(renderSpacer(s, delayCounter * 0.1))
      delayCounter++
    })
  })

  return (
    <span
      ref={containerRef}
      className={cn("inline-flex flex-wrap text-current", className)}
      aria-live="polite"
      style={{ wordSpacing: "normal" }}
      {...props}
    >
      <span className="inline-flex flex-wrap items-baseline" aria-hidden="true">
        {renderedElements}
      </span>
    </span>
  )
}

TextSwap.displayName = "TextSwap"
