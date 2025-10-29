'use client';

import { TabsList, TabsTrigger } from '@/components/ui/tabs';

export function DemoTabs() {
  return (
    <TabsList className="grid w-auto grid-cols-2">
      <TabsTrigger value="upload">Upload</TabsTrigger>
      <TabsTrigger value="chat">Analysis</TabsTrigger>
    </TabsList>
  );
}
