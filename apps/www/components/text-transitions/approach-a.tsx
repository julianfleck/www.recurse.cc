"use client"

import { AnimatePresence, motion } from "motion/react"
import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@recurse/ui/lib/utils"

interface TextTransitionProps extends React.HTMLAttributes<HTMLSpanElement> {
  text?: string
  texts?: string[]
  interval?: number
}

interface Token {
  id: string
  content: string
  isSpace: boolean
  state: "same" | "new" | "removed"
}

export function TextTransitionA({
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
  const activeText = resolvedTexts[activeIndex] ?? ""

  useEffect(() => {
    if (resolvedTexts.length <= 1) return
    const timer = window.setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % resolvedTexts.length)
    }, interval)
    return () => window.clearTimeout(timer)
  }, [resolvedTexts, interval, activeIndex])

  const previousWords = useRef<string[]>([])
  const tokenIdMap = useRef<Map<string, string>>(new Map())
  
  // Tokenize and diff
  const tokens = useMemo(() => {
    const words = activeText.split(/(\s+)/)
    const prevWords = previousWords.current
    
    // Build a set of previous words for quick lookup
    const prevWordSet = new Set(
      prevWords.filter(w => !/^\s+$/.test(w)).map(w => w.toLowerCase())
    )
    
    const result: Token[] = words.map((word, idx): Token => {
      const isSpace = /^\s+$/.test(word)
      const normalized = word.toLowerCase()
      
      // Reuse ID if this word existed before
      let id = tokenIdMap.current.get(`${normalized}-${idx}`)
      if (!id) {
        // Try to find it in nearby positions (±2)
        for (let offset = -2; offset <= 2; offset++) {
          const checkId = `${normalized}-${idx + offset}`
          if (tokenIdMap.current.has(checkId)) {
            id = tokenIdMap.current.get(checkId)
            break
          }
        }
      }
      
      if (!id) {
        id = `${normalized}-${idx}-${Date.now()}-${Math.random()}`
        tokenIdMap.current.set(`${normalized}-${idx}`, id)
      }
      
      const state = isSpace 
        ? "same" 
        : prevWordSet.has(normalized) 
          ? "same" 
          : "new"
      
      return {
        id,
        content: word,
        isSpace,
        state,
      }
    })
    
    previousWords.current = words
    return result
  }, [activeText])

  const handleCopy = (e: React.ClipboardEvent) => {
    e.preventDefault()
    if (e.clipboardData) {
      e.clipboardData.setData("text/plain", activeText)
    }
  }

  // Timing configuration (in seconds)
  const TIMING = {
    // Phase 1: Exit (old tokens fade out + width collapses)
    exitDuration: 0.8,
    
    // Phase 2: Layout shift (gaps open for new tokens)
    layoutDuration: 1.0,
    layoutDelay: 0.4,
    
    // Phase 3: Enter (new tokens fade in)
    enterDuration: 0.8,
    enterBaseDelay: 0.6,
    enterStagger: 0.15,
  }

  let newTokenIndex = 0

  return (
    <span
      className={cn("inline-flex flex-wrap text-current", className)}
      aria-live="polite"
      onCopy={handleCopy}
      style={{ wordSpacing: "normal" }}
      {...props}
    >
      <span className="sr-only">{activeText}</span>
      
      <span className="inline-flex flex-wrap" aria-hidden="true">
        <AnimatePresence mode="popLayout">
          {tokens.map((token) => {
            const isNewToken = token.state === "new"
            const staggerDelay = isNewToken ? newTokenIndex++ * TIMING.enterStagger : 0

            return (
              <motion.span
                key={token.id}
                layout="position"
                // Only animate exit for removed tokens (not in current set)
                exit={{ 
                  opacity: 0, 
                  filter: "blur(4px)", 
                  width: 0,
                  scale: 0.8,
                  transition: {
                    duration: TIMING.exitDuration,
                  }
                }}
                // Only animate entrance for NEW tokens
                initial={isNewToken ? { 
                  opacity: 0, 
                  filter: "blur(6px)", 
                  x: -30,
                  width: 0,
                } : false}
                animate={{ 
                  opacity: 1, 
                  filter: "blur(0px)", 
                  x: 0,
                  width: "auto",
                  transition: isNewToken ? {
                    opacity: { 
                      duration: TIMING.enterDuration, 
                      delay: TIMING.enterBaseDelay + staggerDelay,
                    },
                    filter: { 
                      duration: TIMING.enterDuration, 
                      delay: TIMING.enterBaseDelay + staggerDelay,
                    },
                    x: { 
                      type: "spring", 
                      bounce: 0, 
                      duration: TIMING.enterDuration,
                      delay: TIMING.enterBaseDelay + staggerDelay,
                    },
                    width: { 
                      type: "spring", 
                      bounce: 0, 
                      duration: TIMING.enterDuration,
                      delay: TIMING.enterBaseDelay + staggerDelay,
                    },
                  } : undefined
                }}
                // LAYOUT: Position shift for ALL tokens
                transition={{
                  layout: { 
                    type: "spring", 
                    bounce: 0, 
                    duration: TIMING.layoutDuration,
                    delay: TIMING.layoutDelay,
                  },
                }}
                className="inline-block whitespace-pre overflow-hidden"
              >
                {token.content}
              </motion.span>
            )
          })}
        </AnimatePresence>
      </span>
    </span>
  )
}

TextTransitionA.displayName = "TextTransitionA"
