"use client";

import {
	AnimatedGraphExample,
	type AnimationData,
} from "@/components/examples/graphs/AnimatedGraphExample";
import framesDataImport from "./frames-example.json" with { type: "json" };

// Ensure we have all required fields and handle string keys from JSON
const framesData: AnimationData = {
	baseData: framesDataImport.baseData,
	stepAdditions: framesDataImport.stepAdditions as Record<
		number | string,
		{ nodes: any[]; links: any[] }
	>,
	animationSteps: framesDataImport.animationSteps,
};

export function FramesExample() {
	return <AnimatedGraphExample data={framesData} />;
}
