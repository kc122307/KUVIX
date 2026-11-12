import { Node, Edge } from '@xyflow/react';
import { SourceDocument, SourceEvidence, AudienceType } from './source';

export type DiagramType =
  | 'flowchart'
  | 'process'
  | 'mindmap'
  | 'timeline'
  | 'orgchart'
  | 'comparison'
  | 'infographic'
  | 'cycle';

export type NodeShape =
  | 'rounded'
  | 'rectangle'
  | 'pill'
  | 'diamond'
  | 'hexagon'
  | 'circle'
  | 'callout'
  | 'note';

export interface VisualTheme {
  id: string;
  name: string;
  description: string;
  category: 'minimal' | 'gradient' | 'corporate' | 'creative' | 'dark';
  canvasBg: string;
  gridColor: string;
  nodeBg: string;
  nodeBorder: string;
  nodeText: string;
  nodeSubtext: string;
  accent: string;
  gradient?: string;
  edgeColor: string;
  badgeBg: string;
  badgeText: string;
}

export interface DiagramNodeData {
  title: string;
  subtitle?: string;
  icon?: string;
  shape?: NodeShape;
  stepNumber?: number | string;
  badge?: string;
  stats?: string;
  category?: string;
  isRoot?: boolean;
  accentColor?: string;
  customBg?: string;
  customBorder?: string;
  customText?: string;
  fontSize?: 'sm' | 'base' | 'lg';
  textAlign?: 'left' | 'center';
  borderStyle?: 'solid' | 'dashed';
  evidence?: SourceEvidence;
  isOutdated?: boolean;
  outdatedReason?: string;
  audienceLevel?: AudienceType;
  [key: string]: unknown;
}

export type AppNode = Node<DiagramNodeData>;
export type AppEdge = Edge;

export type AspectRatio = 'free' | '16:9' | '1:1' | '4:3';

export interface Project {
  id: string;
  title: string;
  documentText: string;
  diagramType: DiagramType;
  themeId: string;
  aspectRatio?: AspectRatio;
  sources?: SourceDocument[];
  activeAudience?: AudienceType;
  lastIntent?: string;
  nodes: AppNode[];
  edges: AppEdge[];
  createdAt: number;
  updatedAt: number;
}

export interface SuggestedVisual {
  type: DiagramType;
  title: string;
  description: string;
  confidence: number;
  iconName: string;
  previewNodesCount: number;
}

export interface ParsedEntity {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  level?: number;
  category?: string;
  stepNumber?: number;
  isDecision?: boolean;
  parentId?: string;
  children?: string[];
  connections?: string[];
  meta?: Record<string, string>;
}

export interface AIProviderConfig {
  provider: 'local' | 'gemini' | 'openai' | 'ollama' | 'custom';
  apiKey?: string;
  model?: string;
  endpoint?: string;
}

