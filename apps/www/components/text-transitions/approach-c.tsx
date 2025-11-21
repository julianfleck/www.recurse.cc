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
  state: "same" | "new" | "removed"
}

export function TextTransitionC({
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

  const tokenIdCounter = useRef(0)
  const previousTokens = useRef<Token[]>([])
  const [currentTokens, setCurrentTokens] = useState<Token[]>([])

  // Diff tokens and assign states
  useEffect(() => {
    const words = activeText.split(/(\s+)/)
    const prevWords = previousTokens.current.map(t => t.content.toLowerCase())
    
    const newTokens: Token[] = words.map((word, idx) => {
      const isSpace = /^\s+$/.test(word)
      
      // Try to find matching token in previous state
      const prevIndex = prevWords.indexOf(word.toLowerCase())
      if (prevIndex !== -1 && Math.abs(prevIndex - idx) <= 2) {
        // Reuse ID from previous token
        const prevToken = previousTokens.current[prevIndex]
        return {
          ...prevToken,
          state: "same" as const,
        }
      }
      
      // New token
      tokenIdCounter.current += 1
      return {
        id: tokenIdCounter.current,
        content: word,
        isSpace,
        state: "new" as const,
      }
    })

    setCurrentTokens(newTokens)
    previousTokens.current = newTokens
  }, [activeText])

  const handleCopy = (e: React.ClipboardEvent) => {
    e.preventDefault()
    if (e.clipboardData) {
      e.clipboardData.setData("text/plain", activeText)
    }
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
        {currentTokens.map((token) => {
          if (token.isSpace) {
            return (
              <span key={`space-${token.id}`} className="inline-block whitespace-pre">
                {token.content}
              </span>
            )
          }

          if (token.state === "same") {
            return (
              <motion.span
                key={token.id}
                layout="position"
                className="inline-block whitespace-pre"
                transition={{
                  layout: { type: "spring", bounce: 0, duration: 0.5 },
                }}
              >
                {token.content}
              </motion.span>
            )
          }

          // New token - animate in
          const delay = newTokenIndex * 0.08
          newTokenIndex++

          return (
            <motion.span
              key={token.id}
              layout="position"
              initial={{ width: 0, opacity: 0, filter: "blur(4px)", x: -20 }}
              animate={{ width: "auto", opacity: 1, filter: "blur(0px)", x: 0 }}
              transition={{
                layout: { type: "spring", bounce: 0, duration: 0.5 },
                width: { type: "spring", bounce: 0, duration: 0.6, delay },
                opacity: { duration: 0.4, delay },
                filter: { duration: 0.4, delay },
                x: { type: "spring", bounce: 0, duration: 0.6, delay },
              }}
              className="inline-block whitespace-pre overflow-hidden"
            >
              {token.content}
            </motion.span>
          )
        })}
      </span>
    </span>
  )
}

TextTransitionC.displayName = "TextTransitionC"

