'use client';

import { AnimatedGraphExample, type AnimationData } from '@/components/examples/graphs/AnimatedGraphExample';
import adaptiveSchemasDataImport from './adaptive-schemas-example.json' with { type: 'json' };

// Ensure we have all required fields and handle string keys from JSON
const adaptiveSchemasData: AnimationData = {
  baseData: adaptiveSchemasDataImport.baseData,
  stepAdditions: adaptiveSchemasDataImport.stepAdditions as Record<number | string, { nodes: any[]; links: any[] }>,
  animationSteps: adaptiveSchemasDataImport.animationSteps,
};

export function AdaptiveSchemasExample() {
  return <AnimatedGraphExample data={adaptiveSchemasData} />;
}

