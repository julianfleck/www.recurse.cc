"use client";

import {
	type MotionValue,
	motion,
	useSpring,
	useTransform,
	useVelocity,
} from "framer-motion";
import type React from "react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
	value: number;
	className?: string;
	fontSize?: number;
	duration?: number;
	suffix?: string;
	minDigits?: number;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
	value,
	className,
	fontSize = 14,
	duration = 0.5,
	suffix = "",
	minDigits = 1,
}) => {
	const padding = 2;
	const height = fontSize + padding;

	// Calculate how many digits we need to show, accounting for negative values
	const absValue = Math.abs(value);
	const digitCount =
		absValue >= 1000 ? 4 : absValue >= 100 ? 3 : absValue >= 10 ? 2 : 1;
	const actualDigits = Math.max(minDigits, digitCount);
	const isNegative = value < 0;

	// Add one extra position for potential minus sign
	const totalPositions = actualDigits + 1;

	return (
		<div
			className={cn("flex items-center justify-center font-mono", className)}
			style={{ fontSize }}
		>
			<div className="flex overflow-hidden">
				{Array.from({ length: totalPositions }, (_, index) => {
					const digitPlace = 10 ** (totalPositions - 1 - index);
					const hasSignificantValue = absValue >= digitPlace;

					// Show minus sign in the position right before first significant digit
					const isMinusPosition =
						isNegative && !hasSignificantValue && absValue >= digitPlace / 10;

					if (isMinusPosition) {
						return (
							<div
								className="flex w-[1ch] items-center justify-center"
								key={index}
								style={{ height }}
							>
								-
							</div>
						);
					}

					return (
						<Digit
							duration={duration}
							height={height}
							isLeading={!hasSignificantValue}
							key={index}
							place={digitPlace}
							value={absValue}
						/>
					);
				})}
			</div>
			{suffix && <span className="ml-0.5">{suffix}</span>}
		</div>
	);
};

interface DigitProps {
	place: number;
	value: number;
	height: number;
	duration: number;
	isLeading?: boolean;
}

const Digit: React.FC<DigitProps> = ({
	place,
	value,
	height,
	duration,
	isLeading = false,
}) => {
	const valueRoundedToPlace = Math.floor(value / place);
	const shouldShowNumber = !isLeading || value >= place;

	const animatedValue = useSpring(valueRoundedToPlace, {
		duration: duration * 1000,
		bounce: 0.2,
	});

	useEffect(() => {
		animatedValue.set(valueRoundedToPlace);
	}, [animatedValue, valueRoundedToPlace]);

	return (
		<div className="relative w-[1ch] tabular-nums" style={{ height }}>
			{shouldShowNumber &&
				Array.from({ length: 10 }, (_, i) => (
					<Number height={height} key={i} mv={animatedValue} number={i} />
				))}
		</div>
	);
};

interface NumberProps {
	mv: MotionValue;
	number: number;
	height: number;
}

const Number: React.FC<NumberProps> = ({ mv, number, height }) => {
	// Get velocity of the motion value for blur calculation
	const velocity = useVelocity(mv);

	const y = useTransform(mv, (latest) => {
		const placeValue = latest % 10;
		const offset = (10 + number - placeValue) % 10;

		let memo = offset * height;

		if (offset > 5) {
			memo -= 10 * height;
		}

		return memo;
	});

	// Transform velocity to motion blur - scale blur based on movement speed (subtle effect)
	const motionBlur = useTransform(
		velocity,
		[-50, -25, 0, 25, 50],
		[2, 1, 0, 1, 2],
	);

	return (
		<motion.span
			className="absolute inset-0 flex items-center justify-center"
			style={{
				y,
				filter: useTransform(motionBlur, (blur) => `blur(${blur}px)`),
			}}
		>
			{number}
		</motion.span>
	);
};

export default AnimatedCounter;
