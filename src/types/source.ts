export type SourceType =
  | 'pdf'
  | 'docx'
  | 'pptx'
  | 'markdown'
  | 'text'
  | 'code'
  | 'url'
  | 'pasted';

export interface SourceSection {
  id: string;
  sourceId: string;
  pageNumber?: number;
  slideNumber?: number;
  lineNumber?: number;
  heading?: string;
  content: string;
  codeRef?: string;
}

export interface SourceDocument {
  id: string;
  name: string;
  type: SourceType;
  content: string;
  sections: SourceSection[];
  uploadedAt: number;
  version: number;
  url?: string;
  fileSize?: number;
}

export type VerifiedStatus = 'verified_fact' | 'ai_inferred' | 'unsupported';

export interface SourceEvidence {
  sourceId: string;
  documentName: string;
  pageNumber?: number;
  slideNumber?: number;
  lineNumber?: number;
  heading?: string;
  codeRef?: string;
  excerpt: string;
  verifiedStatus: VerifiedStatus;
  confidenceScore: number; // 0.0 - 1.0
  isOutdated?: boolean;
}

export interface DocumentVersionDiff {
  sourceId: string;
  documentName: string;
  oldVersion: number;
  newVersion: number;
  addedSections: SourceSection[];
  removedSections: SourceSection[];
  modifiedSections: {
    oldSection: SourceSection;
    newSection: SourceSection;
  }[];
  impactedNodeIds: string[];
  suggestedUpdates: {
    nodeId: string;
    field: string;
    oldValue: string;
    newValue: string;
    reason: string;
  }[];
}

export type AudienceType =
  | 'beginner'
  | 'student'
  | 'technical'
  | 'analyst'
  | 'executive'
  | 'customer';

export type DiagnosticSeverity = 'error' | 'warning' | 'info';

export type DiagnosticType =
  | 'missing_step'
  | 'disconnected_node'
  | 'incomplete_decision'
  | 'contradictory_relationship'
  | 'duplicate_concept'
  | 'unsupported_claim'
  | 'missing_dependency'
  | 'unclear_label';

export interface DiagramDiagnostic {
  id: string;
  type: DiagnosticType;
  severity: DiagnosticSeverity;
  title: string;
  explanation: string;
  nodeIds?: string[];
  edgeIds?: string[];
  suggestedFixLabel: string;
}

export interface ClarifyingQuestion {
  id: string;
  question: string;
  context: string;
  options: string[];
  selectedOption?: string;
}

export interface UserIntentResult {
  detectedIntent:
    | 'explain'
    | 'workflow'
    | 'architecture'
    | 'relationships'
    | 'beginner'
    | 'dependencies'
    | 'custom';
  userInstruction: string;
  intentSummary: string;
  recommendedDiagramType: string;
  recommendedAudience: AudienceType;
  clarifyingQuestions: ClarifyingQuestion[];
  focusAreas: string[];
}

