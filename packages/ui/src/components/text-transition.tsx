'use client';

import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../lib/utils';

type TokenType = 'punctuation' | 'space' | 'compound-word' | 'word';

type Token = {
  token: string;
  length: number;
  width: number;
  index: number;
  charStart: number;
  charEnd: number;
  type: TokenType;
  normalizedForm: string;
};

type TokenState = Token & {
  state: 'same' | 'added';
};

type GroupedToken =
  | (TokenState & { prevWidth?: number })
  | {
      tokens: TokenState[];
      state: 'added';
      index: number;
      prevWidth: Array<number | undefined>;
    };

export type TextTransitionProps = Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  'children'
> & {
  /**
   * Explicit text to render (no cycling). If `texts` is provided, it takes precedence.
   */
  text?: string;
  /**
   * Array of texts to cycle through automatically.
   */
  texts?: string[];
  /**
   * Duration (ms) each text stays visible before cycling to the next.
   */
  interval?: number;
  /**
   * Animation speed modifier. Higher values slow the blur/width animation slightly.
   */
  speed?: number;
};

const tokenizeText = (text: string): Token[] => {
  const tokens = text.split(/(\s+|[.,!?;:-])/).filter((token) => token !== '');
  const tokenObjects: Token[] = [];
  let charStart = 0;

  tokens.forEach((token, index) => {
    const type: TokenType = /^[.,!?;:-]$/.test(token)
      ? 'punctuation'
      : /\s/.test(token)
        ? 'space'
        : token.includes('-')
          ? 'compound-word'
          : 'word';

    const normalizedForm = token
      .normalize('NFKC')
      .replace(/[^\p{L}\p{N}]+/gu, '')
      .toLowerCase();
    const width = measureWidth(token);
    const charEnd = charStart + token.length;

    tokenObjects.push({
      token,
      length: token.length,
      width,
      index,
      charStart,
      charEnd,
      type,
      normalizedForm,
    });

    charStart = charEnd;
  });

  return tokenObjects;
};

const compareTexts = (currentTokens: Token[], prevTokens: Token[]) => {
  const currentTextWithState = currentTokens.map((token) => {
    const isShared = prevTokens.some(
      (prevToken) =>
        prevToken.normalizedForm === token.normalizedForm &&
        token.type !== 'space',
    );
    return {
      ...token,
      state: token.type === 'punctuation' ? 'added' : isShared ? 'same' : 'added',
    };
  });

  const prevTextWithState = prevTokens.map((token) => {
    const isShared = currentTokens.some(
      (currentToken) =>
        currentToken.normalizedForm === token.normalizedForm,
    );
    return {
      ...token,
      state: isShared ? 'same' : 'added',
    };
  });

  return { currentText: currentTextWithState, prevText: prevTextWithState };
};

const groupNewTokens = (tokens: TokenState[]) => {
  const groupedTokens: GroupedToken[] = [];
  let currentGroup: TokenState[] = [];

  tokens.forEach((token, index) => {
    if (token.state === 'added') {
      currentGroup.push(token);
    } else {
      if (currentGroup.length > 0) {
        groupedTokens.push({
          tokens: currentGroup,
          state: 'added',
          index: index - currentGroup.length,
          prevWidth: [],
        });
        currentGroup = [];
      }
      groupedTokens.push(token);
    }
  });

  if (currentGroup.length > 0) {
    groupedTokens.push({
      tokens: currentGroup,
      state: 'added',
      index: tokens.length - currentGroup.length,
      prevWidth: [],
    });
  }

  return groupedTokens;
};

const segmentText = (currentText: Token[], prevText: Token[]) => {
  const { currentText: newTokens } = compareTexts(currentText, prevText);
  return groupNewTokens(newTokens);
};

const getAnimationProps = (
  state: TokenState['state'],
  prevWidth?: number,
  width?: number,
  delay = 0,
) => ({
  initial: {
    width: state === 'same' ? 'auto' : state === 'added' ? prevWidth : width,
    opacity: state === 'added' ? 0 : 1,
    filter: state === 'added' ? 'blur(4px)' : 'blur(0px)',
  },
  animate: {
    width: state === 'same' ? 'auto' : state === 'added' ? width : prevWidth,
    opacity: 1,
    filter: 'blur(0px)',
  },
  transition: {
    width:
      state === 'same'
        ? { duration: 0 }
        : prevWidth && width
          ? {
              type: 'spring',
              stiffness: prevWidth > width ? 700 : 200,
              damping: 30,
              delay,
            }
          : undefined,
    opacity: { duration: 0.45, delay },
    filter: { duration: 0.45, delay },
  },
  style: {
    display: 'inline-block',
    overflow: 'hidden',
    whiteSpace: 'pre',
  },
  className: 'inline-block whitespace-pre text-current',
});

const measureWidth = (text: string) => {
  if (typeof document === 'undefined') {
    return text.length * 12;
  }
  const tempElement = document.createElement('span');
  tempElement.style.visibility = 'hidden';
  tempElement.style.position = 'absolute';
  tempElement.style.whiteSpace = 'pre';
  document.body.appendChild(tempElement);
  tempElement.textContent = text;
  const width = tempElement.offsetWidth;
  document.body.removeChild(tempElement);
  return width;
};

type AnimatedTokenProps = {
  token: string;
  state: TokenState['state'];
  prevWidth?: number;
  index: number;
  onWidth: (index: number, width: number) => void;
  delay?: number;
};

const AnimatedToken = ({
  token,
  state,
  prevWidth,
  index,
  onWidth,
  delay = 0,
}: AnimatedTokenProps) => {
  const [width, setWidth] = useState(prevWidth ?? 0);
  const measureRef = useRef<HTMLSpanElement | null>(null);
  const hasReported = useRef(false);

  useEffect(() => {
    if (measureRef.current && !hasReported.current) {
      const newWidth = measureRef.current.getBoundingClientRect().width;
      setWidth(newWidth);
      onWidth(index, newWidth);
      hasReported.current = true;
    }
  }, [token, index, onWidth]);

  if (state === 'same') {
    return (
      <span className="inline-block whitespace-pre" aria-hidden="false">
        {token}
      </span>
    );
  }

  return (
    <>
      <span
        ref={measureRef}
        className="invisible fixed left-0 top-0 whitespace-pre"
        aria-hidden="true"
      >
        {token}
      </span>
      <motion.span {...getAnimationProps(state, prevWidth, width, delay)}>
        {token}
      </motion.span>
    </>
  );
};

type AnimatedTokenGroupProps = {
  tokens: TokenState[];
  state: 'added';
  prevWidth: Array<number | undefined>;
  onWidth: (index: number, width: number) => void;
  baseIndex: number;
};

const AnimatedTokenGroup = ({
  tokens,
  state,
  prevWidth,
  onWidth,
  baseIndex,
}: AnimatedTokenGroupProps) => (
  <>
    {tokens.map((token, i) => {
      const delay = state === 'added' ? i * 0.035 : 0;
      return (
        <AnimatedToken
          key={`animated-${token.token}-${baseIndex + i}`}
          token={token.token}
          state={state}
          prevWidth={prevWidth[i]}
          index={baseIndex + i}
          onWidth={(index, width) => onWidth(index, width)}
          delay={delay}
        />
      );
    })}
  </>
);

export const TextTransition: React.FC<TextTransitionProps> = ({
  text,
  texts,
  className,
  interval = 5200,
  speed = 1000,
  ...props
}) => {
  const resolvedTexts = useMemo(() => {
    if (texts && texts.length > 0) return texts;
    return text ? [text] : [''];
  }, [text, texts]);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeText = resolvedTexts[activeIndex] ?? '';

  useEffect(() => {
    if (resolvedTexts.length <= 1) return;
    const timer = window.setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % resolvedTexts.length);
    }, interval);
    return () => window.clearTimeout(timer);
  }, [resolvedTexts, interval, activeIndex]);

  useEffect(() => {
    setActiveIndex(0);
  }, [resolvedTexts]);

  const previousText = useRef(activeText);
  const [tokens, setTokens] = useState<GroupedToken[]>(() =>
    segmentText(tokenizeText(activeText), tokenizeText(activeText)).map((group) =>
      'tokens' in group
        ? { ...group, prevWidth: group.tokens.map(() => undefined) }
        : { ...group, prevWidth: undefined },
    ),
  );

  const currentWidths = useRef<Map<number, number>>(new Map());
  const previousWidths = useRef<Map<number, number>>(new Map());
  const [transitionKey, setTransitionKey] = useState(0);

  useEffect(() => {
    if (activeText === previousText.current) return;

    const prevTokenized = tokenizeText(previousText.current);
    const nextTokenized = tokenizeText(activeText);

    previousWidths.current = new Map(currentWidths.current);
    currentWidths.current = new Map();

    const grouped = segmentText(nextTokenized, prevTokenized).map((group, index) => {
      if ('tokens' in group) {
        return {
          ...group,
          prevWidth: group.tokens.map((_, i) =>
            previousWidths.current.get(index + i),
          ),
        };
      }
      return {
        ...group,
        prevWidth: previousWidths.current.get(index),
      };
    });

    setTokens(grouped);
    setTransitionKey((prev) => prev + 1);
    previousText.current = activeText;
  }, [activeText]);

  const handleWidthUpdate = useCallback((index: number, width: number) => {
    currentWidths.current.set(index, width);
  }, []);

  return (
    <span
      className={cn('inline-flex flex-wrap text-current', className)}
      aria-live="polite"
      {...props}
    >
      <motion.span
        key={transitionKey}
        className="inline-flex flex-wrap"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0.9, filter: 'blur(1px)' },
          visible: {
            opacity: 1,
            filter: 'blur(0px)',
            transition: {
              duration: speed / 1500,
              staggerChildren: 0.08,
            },
          },
        }}
      >
        {tokens.map((group, index) => {
          if ('tokens' in group) {
            return (
              <AnimatedTokenGroup
                key={`group-${transitionKey}-${index}`}
                tokens={group.tokens}
                state={group.state}
                prevWidth={group.prevWidth}
                onWidth={handleWidthUpdate}
                baseIndex={group.index}
              />
            );
          }
          return (
            <AnimatedToken
              key={`token-${transitionKey}-${group.token}-${index}`}
              token={group.token}
              state={group.state}
              prevWidth={group.prevWidth}
              index={index}
              onWidth={handleWidthUpdate}
            />
          );
        })}
      </motion.span>
    </span>
  );
};

TextTransition.displayName = 'TextTransition';

