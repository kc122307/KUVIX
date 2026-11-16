import { AIProviderConfig, DiagramType } from '../types/diagram';
import { parseTextToDocument, ParsedDocument } from './nlpParser';

const AI_CONFIG_KEY = 'kuvix_ai_provider_config';
const LEGACY_AI_CONFIG_KEY = 'napkin_ai_provider_config';

export interface GeneratedStructure {
  title: string;
  diagramType: DiagramType;
  documentText: string;
  summary: string;
  stepsCount: number;
}

export function getStoredAIConfig(): AIProviderConfig {
  const envGroqKey = (import.meta.env.VITE_GROQ_API_KEY as string | undefined)?.trim();
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY) || localStorage.getItem(LEGACY_AI_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.apiKey && envGroqKey) {
        parsed.apiKey = envGroqKey;
        if (parsed.provider === 'local') {
          parsed.provider = 'groq';
        }
      }
      return parsed;
    }
  } catch (err) {
    console.error('Failed to parse AI config:', err);
  }

  if (envGroqKey) {
    return {
      provider: 'groq',
      model: 'llama-3.3-70b-versatile',
      apiKey: envGroqKey
    };
  }

  return {
    provider: 'local',
    model: 'llama-3.3-70b-versatile'
  };
}

export function saveAIConfig(config: AIProviderConfig): void {
  localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
}

/**
 * Generate a complete visual diagram structure from a single sentence or prompt
 * using Groq AI (LPU ultra-fast inference) with fallback to intelligent local synthesis.
 */
export async function generateStructureWithAI(
  prompt: string,
  category = 'AI diagram',
  config: AIProviderConfig = getStoredAIConfig()
): Promise<GeneratedStructure> {
  const cleanPrompt = prompt.trim();
  const envGroqKey = (import.meta.env.VITE_GROQ_API_KEY as string | undefined)?.trim();
  const groqApiKey = config.provider === 'groq' && config.apiKey
    ? config.apiKey
    : envGroqKey || localStorage.getItem('kuvix_groq_api_key') || (config.apiKey && config.apiKey.startsWith('gsk_') ? config.apiKey : '');

  // 1. Try Groq AI if key is provided or configured
  if (groqApiKey) {
    try {
      const model = config.model || 'llama-3.3-70b-versatile';
      const systemInstruction = `You are KUVIX AI, an expert diagram architect.
Your mission: Given the user's concept, request, or single sentence (in category "${category}"), generate a comprehensive visual diagram structure.

Analyze the intent and select the single BEST diagramType from:
- "flowchart" (decision paths, conditional logic, approvals, branching)
- "process" (linear stepped workflow, pipeline, sequential execution)
- "timeline" (chronological phases, milestones, quarterly roadmap)
- "mindmap" (core idea with branching subtopics, brainstorming)
- "cycle" (closed-loop continuous flywheel, feedback loop, recurrence)
- "comparison" (contrasting options, pros/cons, alternatives)
- "infographic" (bento cards, key pillars, metric highlights)
- "orgchart" (hierarchical structure, roles, team reporting)

Return a strictly valid JSON object matching this schema:
{
  "title": "Clear, Professional Project Title",
  "diagramType": "flowchart" | "process" | "timeline" | "mindmap" | "cycle" | "comparison" | "infographic" | "orgchart",
  "summary": "One sentence describing this diagram",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Concise Step/Node Name (2-5 words)",
      "description": "Specific, actionable detail or explanation",
      "isDecision": false,
      "icon": "Rocket" | "ShieldCheck" | "Database" | "Users" | "CheckCircle2" | "Target" | "GitFork" | "Search" | "Settings"
    }
  ]
}

Provide 5 to 8 thorough, high-value steps that form a coherent visual diagram.`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: cleanPrompt }
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const contentStr = data.choices?.[0]?.message?.content;
        if (contentStr) {
          const parsed = JSON.parse(contentStr);
          if (parsed && parsed.steps && Array.isArray(parsed.steps)) {
            const docMarkdown = `# ${parsed.title || cleanPrompt}
${parsed.summary || `Visual structure generated from: "${cleanPrompt}"`}

${parsed.steps.map((s: { stepNumber?: number; title: string; description: string; isDecision?: boolean }, idx: number) => {
  const num = s.stepNumber || idx + 1;
  const isQuestion = s.isDecision || s.title.includes('?');
  const title = s.title.replace(/^[0-9\.\s]+/, '');
  return `${num}. ${title}${isQuestion && !title.includes('?') ? '?' : ''} - ${s.description}`;
}).join('\n')}
`;
            return {
              title: parsed.title || cleanPrompt,
              diagramType: (parsed.diagramType as DiagramType) || 'flowchart',
              documentText: docMarkdown,
              summary: parsed.summary || `Generated ${parsed.steps.length} steps for "${cleanPrompt}"`,
              stepsCount: parsed.steps.length
            };
          }
        }
      } else {
        console.warn(`Groq API returned HTTP ${response.status}. Falling back to local smart synthesis.`);
      }
    } catch (err) {
      console.warn('Groq API invocation failed, falling back to local synthesis:', err);
    }
  }

  // 2. Intelligent local generative synthesis (Works offline with zero keys!)
  return generateLocalSmartStructure(cleanPrompt, category);
}

/**
 * High-quality deterministic structure generator for instant response
 */
function generateLocalSmartStructure(prompt: string, category: string): GeneratedStructure {
  const lower = prompt.toLowerCase();

  // Deduce diagram type and structure
  let diagramType: DiagramType = 'flowchart';
  if (lower.includes('timeline') || lower.includes('roadmap') || lower.includes('quarter') || lower.includes('202') || lower.includes('history')) {
    diagramType = 'timeline';
  } else if (lower.includes('cycle') || lower.includes('flywheel') || lower.includes('loop') || lower.includes('continuous')) {
    diagramType = 'cycle';
  } else if (lower.includes('compare') || lower.includes('vs') || lower.includes('matrix') || lower.includes('winner')) {
    diagramType = 'comparison';
  } else if (lower.includes('brainstorm') || lower.includes('mindmap') || lower.includes('concept') || lower.includes('ideas')) {
    diagramType = 'mindmap';
  } else if (lower.includes('hierarchy') || lower.includes('org') || lower.includes('team') || lower.includes('structure')) {
    diagramType = 'orgchart';
  } else if (lower.includes('step') || lower.includes('pipeline') || lower.includes('guide') || lower.includes('how to')) {
    diagramType = 'process';
  }

  // Clean prompt into a proper title
  const cleanTitle = prompt.replace(/^(please\s+)?(generate\s+)?(a\s+)?(flowchart|diagram|roadmap|mindmap)?(\s+for\s+|\s+about\s+|\s+on\s+)?/i, '')
    .trim()
    .replace(/^./, (c) => c.toUpperCase()) || 'Strategic Visual Concept';

  // Domain-specific step synthesizers
  let steps: Array<{ title: string; desc: string; isDecision?: boolean }> = [];

  if (lower.includes('skin') || lower.includes('market') || lower.includes('research')) {
    diagramType = 'flowchart';
    steps = [
      { title: 'Market Opportunity Scan', desc: 'Aggregate customer pain points, emerging organic ingredients, and regulatory trends' },
      { title: 'Audience Segmentation', desc: 'Identify core Gen-Z and Millennial buyer personas seeking clean formulations' },
      { title: 'Viable Niche Validated?', desc: 'Assess barrier to entry, production margin potential, and supplier reliability', isDecision: true },
      { title: 'Competitor Benchmark Matrix', desc: 'Contrast top 5 direct competitors on price point, packaging, and social sentiment' },
      { title: 'Product Formulations & Testing', desc: 'Develop dermatologically validated prototypes with sustainable packaging' },
      { title: 'Go-To-Market & Channel Launch', desc: 'Deploy direct-to-consumer influencer campaign and retail partner placement' }
    ];
  } else if (lower.includes('tiktok') || lower.includes('social') || lower.includes('shop')) {
    diagramType = 'process';
    steps = [
      { title: 'Viral Trend Scouting', desc: 'Track rising hashtag velocity, audio trends, and creator purchase engagement' },
      { title: 'Creator Collaboration Briefs', desc: 'Source micro-influencer affiliates with authentic audience resonance' },
      { title: 'Live Stream Showcase Strategy', desc: 'Schedule flash sales and interactive product Q&A demonstrations' },
      { title: 'Order Fulfillment & Logistics', desc: 'Connect automated warehouse shipping with TikTok Shop seller center' },
      { title: 'Customer Feedback & Retargeting', desc: 'Capture user-generated reviews and optimize TikTok ad pixel conversion' }
    ];
  } else if (lower.includes('web develop') || lower.includes('study plan') || lower.includes('coding')) {
    diagramType = 'process';
    steps = [
      { title: 'Web Fundamentals & DOM', desc: 'Master modern semantic HTML5, responsive CSS grid/flexbox, and JavaScript ES6+' },
      { title: 'Frontend Framework Mastery', desc: 'Build reactive component-driven UIs using React, TypeScript, and Tailwind CSS' },
      { title: 'Backend & APIs Architecture', desc: 'Develop REST and GraphQL microservices with Node.js, Express, and PostgreSQL' },
      { title: 'Code Quality Pass?', desc: 'Run automated unit tests, linting, and accessibility audits', isDecision: true },
      { title: 'State Management & Performance', desc: 'Optimize bundle size, caching headers, and client state orchestration' },
      { title: 'CI/CD Cloud Deployment', desc: 'Deploy containerized full-stack applications with Docker to Vercel and AWS' }
    ];
  } else if (lower.includes('party') || lower.includes('birthday') || lower.includes('event')) {
    diagramType = 'timeline';
    steps = [
      { title: 'Theme & Guest Discovery', desc: 'Confirm animal habitat theme, guest headcount, and dietary preferences' },
      { title: 'Venue Booking & Safari Decor', desc: 'Reserve space and arrange jungle safari backdrops, balloons, and costumes' },
      { title: 'Interactive Animal Activities', desc: 'Coordinate petting zoo visit, wildlife scavenger hunt, and face painting' },
      { title: 'Themed Catering & Safari Cake', desc: 'Prepare organic snack boxes and centerpiece animal cake presentation' },
      { title: 'Party Favors & Thank You Notes', desc: 'Distribute adoption certificate goody bags and souvenir photos' }
    ];
  } else if (lower.includes('nba') || lower.includes('basketball') || lower.includes('history')) {
    diagramType = 'infographic';
    steps = [
      { title: 'Iconic Moments Vault', desc: 'Curate hilarious on-court bloopers, mascot antics, and viral referee exchanges' },
      { title: 'Shaqtin a Fool Classics', desc: 'Highlight legendary unforced turnovers and fast-break miscommunications' },
      { title: 'Celebrity & Fan Reactions', desc: 'Capture baseline fan expressions and bench reaction memes' },
      { title: 'Cultural & Meme Legacy', desc: 'Document how bloopers transitioned into viral cultural social media staples' }
    ];
  } else if (lower.includes('equity') || lower.includes('stock') || lower.includes('market') || lower.includes('winner')) {
    diagramType = 'comparison';
    steps = [
      { title: 'Macroeconomic Catalyst Evaluation', desc: 'Analyze interest rate trajectory, enterprise AI capital spend, and liquidity' },
      { title: 'High-Growth Tech Leaders', desc: 'Track outperforming semiconductor and generative AI hyperscalers' },
      { title: 'Energy & Infrastructure Outliers', desc: 'Evaluate nuclear and renewable grid suppliers fueling data center scale' },
      { title: 'Valuation & Multiple Check?', desc: 'Stress-test forward P/E ratios against free cash flow yield', isDecision: true },
      { title: 'Portfolio Allocation Strategy', desc: 'Rebalance risk exposure with defensive hedges and systematic profit-taking' }
    ];
  } else {
    // Universal structured workflow generator
    steps = [
      { title: 'Initiation & Discovery', desc: `Define core scope, stakeholder objectives, and success metrics for ${cleanTitle}` },
      { title: 'Architecture & Design Specification', desc: 'Formulate detailed blueprints, system dependencies, and execution milestones' },
      { title: 'Feasibility Review Passed?', desc: 'Validate technical constraints, budget allocations, and compliance standards', isDecision: true },
      { title: 'Core Implementation Sprint', desc: 'Build foundational deliverables with iterative validation checkpoints' },
      { title: 'Quality Assurance & Telemetry', desc: 'Conduct end-to-end stress testing, user acceptance review, and latency profiling' },
      { title: 'Operational Launch & Retrospective', desc: 'Ship production release and monitor ongoing adoption analytics' }
    ];
  }

  const documentText = `# ${cleanTitle}
*Visual plan synthesized for: ${prompt} (${category})*

${steps.map((s, idx) => `${idx + 1}. ${s.title}${s.isDecision ? '?' : ''} - ${s.desc}`).join('\n')}
`;

  return {
    title: cleanTitle,
    diagramType,
    documentText,
    summary: `Structured ${steps.length}-stage ${diagramType} synthesized for "${prompt}"`,
    stepsCount: steps.length
  };
}

export async function processTextWithAI(
  text: string,
  config: AIProviderConfig = getStoredAIConfig()
): Promise<ParsedDocument> {
  const envGroqKey = (import.meta.env.VITE_GROQ_API_KEY as string | undefined)?.trim();
  const effectiveGroqKey = (config.provider === 'groq' && config.apiKey) ? config.apiKey : envGroqKey;

  // If provider is local and no env key, use our fast, deterministic NLP engine
  if (config.provider === 'local' && !envGroqKey) {
    return parseTextToDocument(text);
  }

  // 1. Try Groq AI if configured or env key exists
  if ((config.provider === 'groq' || !config.provider) && effectiveGroqKey) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${effectiveGroqKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: config.model || 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `Analyze this text and output a JSON visual diagram representation.
Format:
{
  "title": "Diagram Title",
  "dominantType": "process" | "flowchart" | "mindmap" | "timeline" | "orgchart" | "comparison" | "infographic" | "cycle",
  "entities": [
    {
      "id": "node-1",
      "title": "Step/Concept Name",
      "subtitle": "Short detail",
      "icon": "Rocket" | "ShieldCheck" | "Database" | "Users" | "CheckCircle2" | "Target" | "GitFork",
      "stepNumber": 1,
      "isDecision": false
    }
  ]
}`
            },
            { role: 'user', content: text }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsedJson = JSON.parse(content);
          const localParsed = parseTextToDocument(text);
          return {
            title: parsedJson.title || localParsed.title,
            dominantType: (parsedJson.dominantType as DiagramType) || localParsed.dominantType,
            entities: parsedJson.entities || localParsed.entities,
            suggestedVisuals: localParsed.suggestedVisuals,
            hasDecisionLogic: localParsed.hasDecisionLogic,
            hasTimelineData: localParsed.hasTimelineData,
            hasHierarchicalOutline: localParsed.hasHierarchicalOutline
          };
        }
      }
    } catch (err) {
      console.warn('Groq parsing failed, falling back to local NLP engine:', err);
    }
  }

  // 2. Try Gemini if configured
  try {
    if (config.provider === 'gemini' && config.apiKey) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${config.model || 'gemini-1.5-flash'}:generateContent?key=${config.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Analyze this text and output a JSON object representing a visual diagram.
Format:
{
  "title": "Diagram Title",
  "dominantType": "process" | "flowchart" | "mindmap" | "timeline" | "orgchart" | "comparison" | "infographic" | "cycle",
  "entities": [
    {
      "id": "node-1",
      "title": "Step/Concept Name",
      "subtitle": "Short 1-sentence detail",
      "icon": "Rocket" | "ShieldCheck" | "Database" | "Users" | "CheckCircle2" | "Target" | "GitFork",
      "stepNumber": 1,
      "isDecision": false
    }
  ]
}

Text to analyze:
${text}`
                  }
                ]
              }
            ]
          })
        }
      );

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (content) {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedJson = JSON.parse(jsonMatch[0]);
          const localParsed = parseTextToDocument(text);
          return {
            title: parsedJson.title || localParsed.title,
            dominantType: (parsedJson.dominantType as DiagramType) || localParsed.dominantType,
            entities: parsedJson.entities || localParsed.entities,
            suggestedVisuals: localParsed.suggestedVisuals,
            hasDecisionLogic: localParsed.hasDecisionLogic,
            hasTimelineData: localParsed.hasTimelineData,
            hasHierarchicalOutline: localParsed.hasHierarchicalOutline
          };
        }
      }
    }
  } catch (err) {
    console.warn('AI provider call failed or was rate-limited, falling back to local NLP engine:', err);
  }

  // Graceful fallback to our robust local NLP parser
  return parseTextToDocument(text);
}


