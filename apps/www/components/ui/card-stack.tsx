"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";

type Card = {
	id: number;
	content: React.ReactNode;
	className: string;
};

const CardStackComponent = ({
	items,
	offset,
	scaleFactor,
	isPaused = false,
	isHovered = false,
	flexibleHeight = false,
}: {
	items: Card[];
	offset?: number;
	scaleFactor?: number;
	isPaused?: boolean;
	isHovered?: boolean;
	flexibleHeight?: boolean;
}) => {
	const CARD_OFFSET = offset || 10;
	const SCALE_FACTOR = scaleFactor || 0.06;
	const [cards, setCards] = useState<Card[]>(items);
	const [isAnimating, setIsAnimating] = useState(false);
	const intervalRef = useRef<any>(null);

	// Sync cards state when items prop changes
	useEffect(() => {
		setCards(items);
	}, [items]);

	const advanceCard = useCallback(() => {
		if (isAnimating) return; // Prevent double-clicks during animation
		
		setIsAnimating(true);
		
		// Wait a moment for animation to start, then reorder cards
		setTimeout(() => {
			setCards((prevCards: Card[]) => {
				const newArray = [...prevCards];
				// Cycle from front to back: move first card to back
				newArray.push(newArray.shift()!);
				return newArray;
			});
		}, 50); // Small delay to ensure animation starts
		
		// Reset animation state after animation completes
		setTimeout(() => {
			setIsAnimating(false);
		}, 350);
	}, [isAnimating]);

	const stopFlipping = useCallback(() => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
	}, []);

	const startFlipping = useCallback(() => {
		stopFlipping();
		// Reset animation state when starting
		setIsAnimating(false);
		intervalRef.current = setInterval(() => {
			advanceCard();
		}, 3000);
	}, [stopFlipping, advanceCard]);

	useEffect(() => {
		if (!isPaused) {
			startFlipping();
		} else {
			stopFlipping();
			// Reset animation state when pausing
			setIsAnimating(false);
		}
		return () => {
			stopFlipping();
		};
	}, [isPaused, startFlipping, stopFlipping]);

	return (
		<div 
			className={`relative w-full select-none ${flexibleHeight ? 'min-h-60' : 'h-60'}`}
			onClick={isHovered ? advanceCard : undefined}
			style={{
				cursor: isHovered ? 'pointer' : 'default',
			}}
		>
			{cards.map((card, index) => {
				// Calculate target position for each card during animation
				// When animating, all cards move toward their next position simultaneously
				const targetIndex = isAnimating && index > 0 ? index - 1 : index;
				
				// Top offset: 0 when hovered (stacked), otherwise fanned out
				const topOffset = isHovered ? 0 : targetIndex * -CARD_OFFSET;
				
				// Reduced blur aggressiveness: 1px per card depth (was 2px)
				const baseBlur = targetIndex * 1;
				
				// During animation:
				// - Top card (index 0) fades/blurs out heavily
				// - Other cards move to their next position (less blur, bigger scale)
				const isTopCard = index === 0;
				const blurAmount = isAnimating && isTopCard 
					? 8  // Fade out the top card with heavy blur
					: baseBlur;
				
			// Opacity: top card fades during animation, others stay visible
			// When hovered, all cards are solid (no transparency)
			const opacity = isAnimating && isTopCard ? 0 : isHovered ? 1 : targetIndex === 0 ? 1 : 0.95;
				
				// Scale: during animation, all cards grow toward their next position
				const baseScale = 1 - targetIndex * SCALE_FACTOR;
				const scale = isAnimating && isTopCard 
					? 1.05  // Top card scales up slightly as it fades
					: baseScale;
				
				return (
					<motion.div
						key={card.id}
						className={`absolute w-full rounded-lg bg-card ${flexibleHeight ? 'min-h-60' : 'h-60'} ${card.className}`}
						style={{
							transformOrigin: "top center",
							zIndex: cards.length - index,
						}}
						initial={false}
						animate={{
							top: topOffset,
							scale,
							filter: `blur(${blurAmount}px)`,
							opacity,
						}}
						transition={{
							duration: 0.35,
							ease: "easeOut",
						}}
					>
						{card.content}
					</motion.div>
				);
			})}
		</div>
	);
};

export const CardStack = React.memo(CardStackComponent);

