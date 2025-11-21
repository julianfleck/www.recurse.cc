import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import nlp from 'compromise'
import { useSelector } from 'react-redux'
import { formatString } from '../utils/textUtils'
import {
    selectPageData,
    selectSelectedTextLength,
} from '../redux/slices/content'

const tokenizeText = (text) => {
    const tokens = text.split(/(\s+|[.,!?;:-])/).filter((token) => token !== '')
    const tokenObjects = []
    let charStart = 0

    tokens.forEach((token, index) => {
        const type = /^[.,!?;:-]$/.test(token)
            ? 'punctuation'
            : /\s/.test(token)
              ? 'space'
              : token.includes('-')
                ? 'compound-word'
                : 'word'

        const normalizedForm = nlp(token).normalize().out('text')
        const width = measureWidth(token)
        const charEnd = charStart + token.length

        tokenObjects.push({
            token,
            length: token.length,
            width,
            index,
            charStart,
            charEnd,
            type,
            normalizedForm,
        })

        charStart = charEnd
    })

    return tokenObjects
}

const compareTexts = (currentTokens, prevTokens) => {
    const currentTextWithState = currentTokens.map((token) => {
        const isShared = prevTokens.some(
            (prevToken) =>
                prevToken.normalizedForm === token.normalizedForm &&
                token.type !== 'space',
        )
        return {
            ...token,
            state: token.type === 'punctuation' ? 'added' : (isShared ? 'same' : 'added'),
        }
    })

    const prevTextWithState = prevTokens.map((token) => {
        const isShared = currentTokens.some(
            (currentToken) =>
                currentToken.normalizedForm === token.normalizedForm,
        )
        return {
            ...token,
            state: isShared ? 'same' : 'removed',
        }
    })

    return { currentText: currentTextWithState, prevText: prevTextWithState }
}

const groupNewTokens = (tokens) => {
    const groupedTokens = []
    let currentGroup = []

    tokens.forEach((token, index) => {
        if (token.state === 'added') {
            currentGroup.push(token)
        } else {
            if (currentGroup.length > 0) {
                groupedTokens.push({
                    tokens: currentGroup,
                    state: 'added',
                    index: index - currentGroup.length,
                })
                currentGroup = []
            }
            groupedTokens.push(token)
        }
    })

    if (currentGroup.length > 0) {
        groupedTokens.push({
            tokens: currentGroup,
            state: 'added',
            index: tokens.length - currentGroup.length,
        })
    }

    return groupedTokens
}

// Update the segmentText function to use groupNewTokens
const segmentText = (currentText, prevText) => {
    const { currentText: newTokens } = compareTexts(currentText, prevText)
    return groupNewTokens(newTokens)
}

const getAnimationProps = (
    state,
    prevWidth,
    width,
    isTransitioning,
    delay = 0, // Add delay parameter
) => ({
    initial: {
        width:
            state === 'same' ? 'auto' : state === 'added' ? prevWidth : width,
        opacity: state === 'added' ? 0 : 1,
        scale: state === 'added' ? 0.8 : 1,
        filter:
            state === 'same'
                ? 'blur(0px)'
                : state === 'added'
                  ? 'blur(4px)'
                  : 'blur(0px)',
    },
    animate: {
        width:
            state === 'same' ? 'auto' : state === 'added' ? width : prevWidth,
        opacity: state === 'removed' ? 0 : 1,
        scale: state === 'removed' ? 0.8 : 1,
        filter: state === 'removed' ? 'blur(4px)' : 'blur(0px)',
    },
    transition: {
        width:
            state === 'same'
                ? { duration: 0 }
                : prevWidth > width
                  ? { type: 'spring', stiffness: 700, damping: 30, delay }
                  : { type: 'spring', stiffness: 200, damping: 30, delay },
        opacity: { duration: 0.5, delay },
        scale: { duration: 0.2, delay },
        filter: { duration: 0.45, delay },
    },
    style: {
        display: 'inline-block',
        overflow: 'hidden',
        whiteSpace: 'pre',
    },
    className: `transition-colors duration-600 ${state === 'added' && isTransitioning ? 'text-green-400' : state === 'removed' && isTransitioning ? 'text-red-400' : 'text-gray-900'} `,
})

const measureWidth = (text) => {
    const tempElement = document.createElement('span')
    tempElement.style.visibility = 'hidden'
    tempElement.style.position = 'absolute'
    tempElement.style.whiteSpace = 'pre'
    document.body.appendChild(tempElement)
    tempElement.textContent = text
    const width = tempElement.offsetWidth
    document.body.removeChild(tempElement)
    return width
}

// Define the AnimatedToken component
const AnimatedToken = ({
    token,
    state,
    prevWidth,
    index,
    onWidth,
    isTransitioning,
    measureRef,
    delay, // Add delay as a prop
}) => {
    const [width, setWidth] = useState(0)
    const hasReported = useRef(false)

    useEffect(() => {
        if (measureRef && measureRef.current && !hasReported.current) {
            const newWidth = measureRef.current.getBoundingClientRect().width
            setWidth(newWidth)
            onWidth(index, newWidth)
            hasReported.current = true
        }
    }, [token, index, onWidth, measureRef])

    return (
        <>
            <span
                ref={measureRef}
                className="invisible fixed left-0 top-0 whitespace-pre"
                aria-hidden="true"
            >
                {token}
            </span>
            <motion.span
                {...getAnimationProps(
                    state,
                    prevWidth,
                    width,
                    isTransitioning,
                    delay, // Pass delay to animation props
                )}
            >
                {token}
            </motion.span>
        </>
    )
}

// Define the AnimatedTokenGroup component
const AnimatedTokenGroup = ({
    tokens,
    state,
    prevWidths,
    onWidth,
    isTransitioning,
}) => {
    const measureRefs = useRef(tokens.map(() => React.createRef()))

    useEffect(() => {
        const newWidths = measureRefs.current.map((ref) => {
            if (ref.current) {
                return ref.current.getBoundingClientRect().width
            }
            return 0
        })
        newWidths.forEach((width, index) => onWidth(index, width))
    }, [tokens, onWidth])

    return (
        <>
            {tokens.map((token, i) => {
                const delay = state === 'added' ? i * 0.035 : 0 // Calculate delay based on position
                return (
                    <AnimatedToken
                        key={`animated-${token.token}-${i}`}
                        token={token.token}
                        state={state}
                        prevWidth={prevWidths[i]}
                        index={i}
                        onWidth={(index, width) => onWidth(index, width)}
                        isTransitioning={isTransitioning}
                        measureRef={measureRefs.current[i]}
                        delay={delay} // Pass delay to AnimatedToken
                    />
                )
            })}
        </>
    )
}

const TextTransition = ({ speed, textShort, textMedium, textLong }) => {
    const pageData = useSelector(selectPageData)
    const reduxTextLength = useSelector(selectSelectedTextLength)

    const texts = {
        short: textShort || pageData?.attributes?.Text?.Short || '',
        medium: textMedium || pageData?.attributes?.Text?.Medium || '',
        long: textLong || pageData?.attributes?.Text?.Long || '',
    }

    const [textLength, setTextLength] = useState(reduxTextLength)
    const [currentText, setCurrentText] = useState(texts[textLength] || '')
    const [tokens, setTokens] = useState([])
    const currentWidths = useRef(new Map())
    const previousWidths = useRef(new Map())
    const [transitionKey, setTransitionKey] = useState(0)
    const [isTransitioning, setIsTransitioning] = useState(false)

    useEffect(() => {
        setTextLength(reduxTextLength)
    }, [reduxTextLength])

    useEffect(() => {
        if (!pageData && !textShort && !textMedium && !textLong) return

        const nextText = texts[textLength] || ''
        const currentTokenizedText = tokenizeText(currentText)
        const nextTokenizedText = tokenizeText(nextText)

        previousWidths.current = new Map(currentWidths.current)
        currentWidths.current = new Map()

        const groupedTokens = segmentText(
            nextTokenizedText,
            currentTokenizedText,
        )

        setTokens(
            groupedTokens.map((group, index) => {
                if (Array.isArray(group.tokens)) {
                    return {
                        ...group,
                        prevWidth: group.tokens.map((token, i) =>
                            previousWidths.current.get(index + i),
                        ),
                    }
                }
                return {
                    ...group,
                    prevWidth: previousWidths.current.get(index),
                }
            }),
        )
        setTransitionKey((prev) => prev + 1)
        setCurrentText(nextText)
    }, [textLength, pageData, textShort, textMedium, textLong])

    const handleWidthUpdate = (index, width) => {
        currentWidths.current.set(index, width)
    }

    return (
        <div>
            <motion.div
                className=""
                key={transitionKey}
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: {
                        opacity: 1,
                        transition: {
                            staggerChildren: 0.08,
                        },
                    },
                }}
            >
                {tokens.map((group, index) => {
                    if (Array.isArray(group.tokens)) {
                        return (
                            <AnimatedTokenGroup
                                key={`${transitionKey}-group-${index}`}
                                tokens={group.tokens}
                                state={group.state}
                                prevWidths={group.prevWidth}
                                onWidth={(i, width) =>
                                    handleWidthUpdate(index + i, width)
                                }
                                isTransitioning={isTransitioning}
                            />
                        )
                    }
                    return (
                        <AnimatedToken
                            key={`${transitionKey}-${group.token}-${index}`}
                            token={group.token}
                            state={group.state}
                            prevWidth={group.prevWidth}
                            index={index}
                            onWidth={handleWidthUpdate}
                            isTransitioning={isTransitioning}
                        />
                    )
                })}
            </motion.div>
        </div>
    )
}

export default TextTransition
