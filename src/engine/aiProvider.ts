import { AIProviderConfig, DiagramType } from '../types/diagram';
import { parseTextToDocument, ParsedDocument } from './nlpParser';

const AI_CONFIG_KEY = 'kuvix_ai_provider_config';
const LEGACY_AI_CONFIG_KEY = 'napkin_ai_provider_config';

export function getStoredAIConfig(): AIProviderConfig {
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY) || localStorage.getItem(LEGACY_AI_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse AI config:', err);
  }
  return {
    provider: 'local',
    model: 'built-in-heuristic'
  };
}

export function saveAIConfig(config: AIProviderConfig): void {
  localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
}

export async function processTextWithAI(
  text: string,
  config: AIProviderConfig = getStoredAIConfig()
): Promise<ParsedDocument> {
  // If provider is local, use our fast, deterministic NLP engine
  if (config.provider === 'local' || !config.apiKey) {
    return parseTextToDocument(text);
  }

  // If user configured an external LLM (Gemini / OpenAI / Ollama), we can enhance parsing
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

