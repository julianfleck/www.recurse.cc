"use client";

import {
  AnimatedGraphExample,
  type AnimationData,
} from "@/components/examples/graphs/AnimatedGraphExample";
import temporalVersioningDataImport from "./temporal-versioning-example.json" with {
  type: "json",
};

// Ensure we have all required fields and handle string keys from JSON
const temporalVersioningData: AnimationData = {
  baseData: temporalVersioningDataImport.baseData,
  stepAdditions: temporalVersioningDataImport.stepAdditions as Record<
    number | string,
    { nodes: any[]; links: any[] }
  >,
  animationSteps: temporalVersioningDataImport.animationSteps,
};

export function TemporalVersioningExample() {
  return <AnimatedGraphExample data={temporalVersioningData} />;
}
