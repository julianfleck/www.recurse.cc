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
  id: string
  content: string
  isSpace: boolean
  width: number
  x: number
  y: number
}

export function TextTransitionB({
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
  const measureRef = useRef<HTMLDivElement>(null)
  const [tokens, setTokens] = useState<Token[]>([])

  useEffect(() => {
    if (resolvedTexts.length <= 1) return
    const timer = window.setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % resolvedTexts.length)
    }, interval)
    return () => window.clearTimeout(timer)
  }, [resolvedTexts, interval, activeIndex])

  // Measure and position tokens
  useEffect(() => {
    if (!measureRef.current) return

    const words = activeText.split(/(\s+)/)
    const measured: Token[] = []
    let currentX = 0
    let currentY = 0
    const lineHeight = 60 // Approximate line height

    // Create temporary elements to measure
    const tempContainer = document.createElement("div")
    tempContainer.style.position = "absolute"
    tempContainer.style.visibility = "hidden"
    tempContainer.style.whiteSpace = "pre"
    tempContainer.style.font = window.getComputedStyle(measureRef.current).font
    document.body.appendChild(tempContainer)

    words.forEach((word, idx) => {
      tempContainer.textContent = word
      const width = tempContainer.getBoundingClientRect().width

      measured.push({
        id: `${word.toLowerCase()}-${idx}`,
        content: word,
        isSpace: /^\s+$/.test(word),
        width,
        x: currentX,
        y: currentY,
      })

      currentX += width
    })

    document.body.removeChild(tempContainer)
    setTokens(measured)
  }, [activeText])

  const handleCopy = (e: React.ClipboardEvent) => {
    e.preventDefault()
    if (e.clipboardData) {
      e.clipboardData.setData("text/plain", activeText)
    }
  }

  const containerHeight = Math.max(...tokens.map(t => t.y)) + 80

  return (
    <span
      ref={measureRef}
      className={cn("inline-block text-current relative", className)}
      aria-live="polite"
      onCopy={handleCopy}
      style={{ wordSpacing: "normal", minHeight: containerHeight }}
      {...props}
    >
      <span className="sr-only">{activeText}</span>
      
      <span 
        className="block relative" 
        aria-hidden="true"
        style={{ height: containerHeight }}
      >
        {tokens.map((token, idx) => (
          <motion.span
            key={token.id}
            initial={{ opacity: 0, filter: "blur(4px)", x: token.x - 20, y: token.y }}
            animate={{ opacity: 1, filter: "blur(0px)", x: token.x, y: token.y }}
            exit={{ opacity: 0 }}
            transition={{
              type: "spring",
              bounce: 0,
              duration: 0.6,
              delay: idx * 0.05,
            }}
            className="absolute whitespace-pre"
            style={{ left: 0, top: 0 }}
          >
            {token.content}
          </motion.span>
        ))}
      </span>
    </span>
  )
}

TextTransitionB.displayName = "TextTransitionB"

