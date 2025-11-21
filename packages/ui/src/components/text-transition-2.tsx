"use client"

import { AnimatePresence, motion } from "motion/react"
import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@recurse/ui/lib/utils"

interface TextTransitionProps extends React.HTMLAttributes<HTMLSpanElement> {
  text?: string
  texts?: string[]
  interval?: number
  speed?: number
}

export function TextTransition2({
  text,
  texts,
  className,
  interval = 5200,
  speed = 1000,
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

  useEffect(() => {
    setActiveIndex(0)
  }, [resolvedTexts])

  // Split only on spaces, keeping punctuation with words
  const words = activeText.split(/(\s+)/)
  const previousWords = useRef<string[]>([])
  const [transitionKey, setTransitionKey] = useState(0)

  // Determine which words are new vs existing
  const wordsWithState = useMemo(() => {
    // Create a map of word -> positions from previous text
    const prevWordPositions = new Map<string, number[]>()
    previousWords.current.forEach((word, idx) => {
      if (!/^\s+$/.test(word)) {
        const normalized = word.toLowerCase()
        if (!prevWordPositions.has(normalized)) {
          prevWordPositions.set(normalized, [])
        }
        prevWordPositions.get(normalized)!.push(idx)
      }
    })
    
    const result = words.map((word, idx) => {
      const isSpace = /^\s+$/.test(word)
      if (isSpace) {
        return { word, isNew: false, isSpace, idx }
      }

      const normalized = word.toLowerCase()
      const prevPositions = prevWordPositions.get(normalized) || []
      
      // Word is "same" if it appears in previous text and is in a similar position
      // (within ±2 positions to account for small shifts)
      const isSimilarPosition = prevPositions.some(prevIdx => Math.abs(prevIdx - idx) <= 2)
      const isNew = !isSimilarPosition

      return { word, isNew, isSpace, idx }
    })

    return result
  }, [words])

  useEffect(() => {
    if (activeText !== previousWords.current.join('')) {
      previousWords.current = words
      setTransitionKey(prev => prev + 1)
    }
  }, [activeText, words])

  const handleCopy = (e: React.ClipboardEvent) => {
    e.preventDefault()
    if (e.clipboardData) {
      e.clipboardData.setData("text/plain", activeText)
    }
  }

  let newWordCount = 0

  return (
    <span
      className={cn("inline-flex flex-wrap text-current", className)}
      aria-live="polite"
      onCopy={handleCopy}
      style={{ wordSpacing: "normal" }}
      {...props}
    >
      <span className="sr-only">{activeText}</span>
      
      <motion.span
        key={transitionKey}
        className="inline-flex flex-wrap"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 1 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.08,
            },
          },
        }}
        aria-hidden="true"
      >
        {wordsWithState.map(({ word, isNew, isSpace, idx }) => {
          if (isSpace) {
            return (
              <span key={`space-${idx}`} className="inline-block whitespace-pre">
                {word}
              </span>
            )
          }

          // Don't animate existing words - render them immediately
          if (!isNew) {
            return (
              <span key={`same-${word}-${idx}`} className="inline-block whitespace-pre">
                {word}
              </span>
            )
          }

          // Animate new words with stagger based on how many new words came before
          const currentNewIndex = newWordCount++
          
          return (
            <motion.span
              key={`new-${word}-${idx}`}
              className="inline-block whitespace-pre overflow-hidden"
              variants={{
                hidden: {
                  width: 0,
                  opacity: 0,
                  filter: "blur(4px)",
                  x: -20,
                },
                visible: {
                  width: "auto",
                  opacity: 1,
                  filter: "blur(0px)",
                  x: 0,
                  transition: {
                    type: "spring",
                    bounce: 0,
                    duration: 0.6,
                    delay: currentNewIndex * 0.08,
                  }
                },
              }}
            >
              {word}
            </motion.span>
          )
        })}
      </motion.span>
    </span>
  )
}

TextTransition2.displayName = "TextTransition2"
