'use client';

import {
  AnimatedGraphExample,
  type AnimationData,
} from '@/components/examples/graphs/AnimatedGraphExample';
import { Tab, Tabs } from '@/components/tabs';
import meetingNotesDataImport from './adaptive-schemas-meeting-notes.json' with {
  type: 'json',
  type: 'json',
  type: 'json',
};
import researchPaperDataImport from './adaptive-schemas-research-paper.json' with {
  type: 'json',
  type: 'json',
  type: 'json',
};

// Ensure we have all required fields and handle string keys from JSON
const researchPaperData: AnimationData = {
  baseData: researchPaperDataImport.baseData,
  stepAdditions: researchPaperDataImport.stepAdditions as Record<
    number | string,
    { nodes: any[]; links: any[] }
  >,
  animationSteps: researchPaperDataImport.animationSteps,
};

const meetingNotesData: AnimationData = {
  baseData: meetingNotesDataImport.baseData,
  stepAdditions: meetingNotesDataImport.stepAdditions as Record<
    number | string,
    { nodes: any[]; links: any[] }
  >,
  animationSteps: meetingNotesDataImport.animationSteps,
};

export function AdaptiveSchemasExample() {
  return (
    <Tabs className="p-0" items={['Research Paper', 'Meeting Notes']}>
      <Tab className="p-0" value="Research Paper">
        <AnimatedGraphExample
          className="m-0 rounded-none border-0 p-0"
          data={researchPaperData}
          key="research-paper"
        />
      </Tab>
      <Tab className="p-0" value="Meeting Notes">
        <AnimatedGraphExample
          className="m-0 rounded-none border-0 p-0"
          data={meetingNotesData}
          key="meeting-notes"
        />
      </Tab>
    </Tabs>
  );
}
