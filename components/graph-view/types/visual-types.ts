export type NodeVisualState = 'default' | 'selected' | 'dimmed' | 'hovered';
export type NodeLayoutMode = 'force' | 'hierarchical';

export interface NodeVisualData {
  id: string;
  title: string;
  type: string;
  summary?: string | null | undefined;
}

export interface NodeVisualProps {
  state: NodeVisualState;
  currentZoomLevel: number;
  layout: NodeLayoutMode;
  data: NodeVisualData;
}
