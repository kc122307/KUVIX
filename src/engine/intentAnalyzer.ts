import { DiagramType } from '../types/diagram';
import { AudienceType, SourceDocument, UserIntentResult, ClarifyingQuestion } from '../types/source';

export interface IntentPreset {
  id: string;
  label: string;
  instruction: string;
  recommendedType: DiagramType;
  recommendedAudience: AudienceType;
  description: string;
  icon: string;
}

export const INTENT_PRESETS: IntentPreset[] = [
  {
    id: 'explain',
    label: 'Explain through a Diagram',
    instruction: 'Explain this document through a clear, easy-to-follow visual diagram.',
    recommendedType: 'process',
    recommendedAudience: 'student',
    description: 'Transform complex technical concepts into intuitive conceptual stages.',
    icon: 'Lightbulb'
  },
  {
    id: 'workflow',
    label: 'Convert into Business Workflow',
    instruction: 'Convert this information into an executive business workflow with KPIs and decision points.',
    recommendedType: 'flowchart',
    recommendedAudience: 'analyst',
    description: 'Map operational procedures, approvals, stakeholders, and milestones.',
    icon: 'GitBranch'
  },
  {
    id: 'architecture',
    label: 'Complete Software Architecture',
    instruction: 'Generate a complete software architecture diagram detailing services, APIs, databases, and caching.',
    recommendedType: 'process',
    recommendedAudience: 'technical',
    description: 'Engineering blueprint mapping frontend, gateways, microservices, and storage layers.',
    icon: 'Server'
  },
  {
    id: 'relationships',
    label: 'Identify Component Relationships',
    instruction: 'Identify relationships between all important components and systems.',
    recommendedType: 'mindmap',
    recommendedAudience: 'technical',
    description: 'Interconnected network map showing dependencies, parent-child hierarchies, and links.',
    icon: 'Network'
  },
  {
    id: 'beginner',
    label: 'Beginner-Friendly Explanation',
    instruction: 'Create a beginner-friendly explanation with intuitive analogies and simple steps.',
    recommendedType: 'infographic',
    recommendedAudience: 'beginner',
    description: 'Demystify dense jargon with friendly visual steps and clear everyday analogies.',
    icon: 'Smile'
  },
  {
    id: 'dependencies',
    label: 'Highlight Dependencies & Decisions',
    instruction: 'Highlight critical system dependencies, decision points, and conditional fallback paths.',
    recommendedType: 'flowchart',
    recommendedAudience: 'analyst',
    description: 'Expose blockers, decision gates, error branches, and prerequisite chains.',
    icon: 'AlertTriangle'
  }
];

/**
 * Intelligent User Intent Analyzer
 * Analyzes uploaded content and instructions, identifies ambiguities, and generates clarifying questions.
 */
export function analyzeUserIntent(
  content: string,
  userInstruction: string,
  sources: SourceDocument[] = []
): UserIntentResult {
  const instrLower = (userInstruction || '').toLowerCase();
  const contentLower = (content || '').toLowerCase();

  // 1. Detect Intent Category
  let detectedIntent: UserIntentResult['detectedIntent'] = 'explain';
  let recommendedDiagramType: DiagramType = 'process';
  let recommendedAudience: AudienceType = 'beginner';
  let intentSummary = 'Generate visual representation of core document concepts.';

  if (instrLower.includes('architecture') || instrLower.includes('software') || instrLower.includes('tech') || instrLower.includes('microservice')) {
    detectedIntent = 'architecture';
    recommendedDiagramType = 'process';
    recommendedAudience = 'technical';
    intentSummary = 'Deconstruct technical architecture into interconnected service tiers.';
  } else if (instrLower.includes('workflow') || instrLower.includes('business') || instrLower.includes('process') || instrLower.includes('sop')) {
    detectedIntent = 'workflow';
    recommendedDiagramType = 'flowchart';
    recommendedAudience = 'analyst';
    intentSummary = 'Map sequential business workflow with operational gates and outcomes.';
  } else if (instrLower.includes('relationship') || instrLower.includes('mindmap') || instrLower.includes('component') || instrLower.includes('hierarchy')) {
    detectedIntent = 'relationships';
    recommendedDiagramType = 'mindmap';
    recommendedAudience = 'technical';
    intentSummary = 'Map relational graph identifying parent-child and peer component links.';
  } else if (instrLower.includes('beginner') || instrLower.includes('simple') || instrLower.includes('student') || instrLower.includes('easy')) {
    detectedIntent = 'beginner';
    recommendedDiagramType = 'infographic';
    recommendedAudience = 'beginner';
    intentSummary = 'Create beginner-oriented visual explanation with plain-language definitions.';
  } else if (instrLower.includes('dependenc') || instrLower.includes('decision') || instrLower.includes('branch') || instrLower.includes('condition')) {
    detectedIntent = 'dependencies';
    recommendedDiagramType = 'flowchart';
    recommendedAudience = 'analyst';
    intentSummary = 'Focus diagram on decision gates, dependencies, and alternative routes.';
  } else if (userInstruction.trim().length > 0) {
    detectedIntent = 'custom';
    recommendedDiagramType = 'process';
    recommendedAudience = 'analyst';
    intentSummary = `Custom visualization tailored to instruction: "${userInstruction}"`;
  }

  // 2. Identify Focus Areas & Entities
  const focusAreas: string[] = [];
  if (contentLower.includes('auth') || contentLower.includes('security') || contentLower.includes('oauth')) focusAreas.push('Authentication & Security');
  if (contentLower.includes('database') || contentLower.includes('postgres') || contentLower.includes('redis') || contentLower.includes('storage')) focusAreas.push('Data Persistence & Caching');
  if (contentLower.includes('api') || contentLower.includes('gateway') || contentLower.includes('rest') || contentLower.includes('graphql')) focusAreas.push('API Routing & Communication');
  if (contentLower.includes('deploy') || contentLower.includes('docker') || contentLower.includes('k8s') || contentLower.includes('cloud')) focusAreas.push('Deployment & Infrastructure');
  if (contentLower.includes('user') || contentLower.includes('customer') || contentLower.includes('onboarding')) focusAreas.push('User Journey & UX Touchpoints');
  if (focusAreas.length === 0) focusAreas.push('General Workflow Execution', 'Core Concepts & Flow');

  // 3. Generate Clarifying Questions when context is rich or ambiguous
  const clarifyingQuestions: ClarifyingQuestion[] = [];

  // Ambiguity check 1: Level of abstraction
  clarifyingQuestions.push({
    id: 'clarify-depth',
    question: 'What level of technical depth would best serve your goals?',
    context: 'The source contains multiple abstraction tiers.',
    options: [
      'High-Level Executive Overview (Major phases & outcomes)',
      'Detailed Technical Architecture (Services, data pipelines & protocols)',
      'Step-by-Step Operator Flow (Individual actions & checklists)'
    ],
    selectedOption: recommendedAudience === 'technical'
      ? 'Detailed Technical Architecture (Services, data pipelines & protocols)'
      : 'High-Level Executive Overview (Major phases & outcomes)'
  });

  // Ambiguity check 2: Decision handling
  if (contentLower.includes('if') || contentLower.includes('decision') || contentLower.includes('or ') || detectedIntent === 'dependencies') {
    clarifyingQuestions.push({
      id: 'clarify-decisions',
      question: 'How should conditional logic and failure states be displayed?',
      context: 'Multiple decision branches were identified in the source text.',
      options: [
        'Highlight Happy Path only (keep layout linear and clean)',
        'Explicit Decision Gates (include diamond nodes with Yes/No branches)',
        'Full Error & Failover Coverage (include fallback recovery paths)'
      ],
      selectedOption: 'Explicit Decision Gates (include diamond nodes with Yes/No branches)'
    });
  }

  // Ambiguity check 3: Multi-document synthesis
  if (sources.length > 1) {
    clarifyingQuestions.push({
      id: 'clarify-sources',
      question: 'How should the multiple project documents be combined?',
      context: `${sources.length} separate documents are available in this project.`,
      options: [
        'Unified End-to-End Pipeline (merge all documents into one seamless flow)',
        `Primary focus on "${sources[0].name}" with references to others`,
        'Comparison Matrix (highlight differences and cross-document dependencies)'
      ],
      selectedOption: 'Unified End-to-End Pipeline (merge all documents into one seamless flow)'
    });
  }

  return {
    detectedIntent,
    userInstruction: userInstruction || INTENT_PRESETS[0].instruction,
    intentSummary,
    recommendedDiagramType,
    recommendedAudience,
    clarifyingQuestions,
    focusAreas
  };
}

