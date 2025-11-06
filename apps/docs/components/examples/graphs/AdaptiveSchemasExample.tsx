'use client';

import { AnimatedGraphExample, type AnimationData } from '@/components/examples/graphs/AnimatedGraphExample';
import meetingNotesDataImport from './adaptive-schemas-meeting-notes.json' with { type: 'json' };
import researchPaperDataImport from './adaptive-schemas-research-paper.json' with { type: 'json' };
import { Tabs, Tab } from 'fumadocs-ui/components/tabs';

// Ensure we have all required fields and handle string keys from JSON
const researchPaperData: AnimationData = {
  baseData: researchPaperDataImport.baseData,
  stepAdditions: researchPaperDataImport.stepAdditions as Record<number | string, { nodes: any[]; links: any[] }>,
  animationSteps: researchPaperDataImport.animationSteps,
};

const meetingNotesData: AnimationData = {
  baseData: meetingNotesDataImport.baseData,
  stepAdditions: meetingNotesDataImport.stepAdditions as Record<number | string, { nodes: any[]; links: any[] }>,
  animationSteps: meetingNotesDataImport.animationSteps,
};

export function AdaptiveSchemasExample() {
  return (
    <Tabs items={['Research Paper', 'Meeting Notes']}>
      <Tab value="Research Paper">
        <AnimatedGraphExample data={researchPaperData} />
      </Tab>
      <Tab value="Meeting Notes">
        <AnimatedGraphExample data={meetingNotesData} />
      </Tab>
    </Tabs>
  );
}
