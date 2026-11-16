import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ArrowRight,
  Shuffle,
  Briefcase,
  CheckSquare,
  FileText,
  PenTool,
  GitFork,
  Lightbulb,
  Zap,
  Loader2,
  TrendingUp,
  ShoppingBag,
  Package,
  Code,
  Smartphone,
  Cake,
  Activity,
  Layers,
  CheckCircle2,
  Workflow,
  LucideIcon
} from 'lucide-react';
import { useDiagramStore } from '../../store/useDiagramStore';
import { getStoredAIConfig } from '../../engine/aiProvider';

interface PromptPreset {
  id: string;
  category: string;
  text: string;
  icon: LucideIcon;
  suggestedType: string;
}

const ALL_PROMPTS: PromptPreset[] = [
  // Project management
  {
    id: 'pm-1',
    category: 'Project management',
    text: 'Marketing research on the skincare industry',
    icon: TrendingUp,
    suggestedType: 'flowchart'
  },
  {
    id: 'pm-2',
    category: 'Project management',
    text: 'Customer onboarding decision flow with KYC verification',
    icon: CheckSquare,
    suggestedType: 'flowchart'
  },
  {
    id: 'pm-3',
    category: 'Project management',
    text: 'Quarterly product launch roadmap for SaaS platform',
    icon: Briefcase,
    suggestedType: 'timeline'
  },
  {
    id: 'pm-4',
    category: 'Project management',
    text: 'Agile sprint delivery cycle and retrospective review',
    icon: Workflow,
    suggestedType: 'cycle'
  },

  // AI planning
  {
    id: 'plan-1',
    category: 'AI planning',
    text: 'How to learn web development skill and study plan',
    icon: Code,
    suggestedType: 'process'
  },
  {
    id: 'plan-2',
    category: 'AI planning',
    text: 'How to learn basic coding for app development',
    icon: Smartphone,
    suggestedType: 'process'
  },
  {
    id: 'plan-3',
    category: 'AI planning',
    text: 'Enterprise cloud migration roadmap across multi-cloud infrastructure',
    icon: Layers,
    suggestedType: 'timeline'
  },
  {
    id: 'plan-4',
    category: 'AI planning',
    text: 'Incident response triage and resolution escalation workflow',
    icon: Activity,
    suggestedType: 'flowchart'
  },

  // AI summary
  {
    id: 'sum-1',
    category: 'AI summary',
    text: 'Three most popular topics on TikTok Shop',
    icon: ShoppingBag,
    suggestedType: 'process'
  },
  {
    id: 'sum-2',
    category: 'AI summary',
    text: 'Top 3 winners in equity markets in 2024',
    icon: TrendingUp,
    suggestedType: 'comparison'
  },
  {
    id: 'sum-3',
    category: 'AI summary',
    text: 'The most ridiculous moments in NBA history',
    icon: Activity,
    suggestedType: 'infographic'
  },
  {
    id: 'sum-4',
    category: 'AI summary',
    text: 'Global semiconductor supply chain and production stages',
    icon: Layers,
    suggestedType: 'process'
  },

  // AI design
  {
    id: 'des-1',
    category: 'AI design',
    text: 'Developing visual concepts for a new packaging design',
    icon: Package,
    suggestedType: 'process'
  },
  {
    id: 'des-2',
    category: 'AI design',
    text: 'Design system tokens and UI component hierarchy',
    icon: PenTool,
    suggestedType: 'mindmap'
  },
  {
    id: 'des-3',
    category: 'AI design',
    text: 'E-commerce mobile checkout wireframe user journey',
    icon: Workflow,
    suggestedType: 'flowchart'
  },
  {
    id: 'des-4',
    category: 'AI design',
    text: 'Brand identity redesign and stakeholder approval matrix',
    icon: Briefcase,
    suggestedType: 'comparison'
  },

  // AI diagram
  {
    id: 'diag-1',
    category: 'AI diagram',
    text: 'Microservices architecture with API Gateway, gRPC, and Redis',
    icon: Layers,
    suggestedType: 'process'
  },
  {
    id: 'diag-2',
    category: 'AI diagram',
    text: 'DevOps continuous integration and automated deployment flywheel',
    icon: Workflow,
    suggestedType: 'cycle'
  },
  {
    id: 'diag-3',
    category: 'AI diagram',
    text: 'SaaS user authentication and OAuth 2.0 token verification path',
    icon: CheckCircle2,
    suggestedType: 'flowchart'
  },
  {
    id: 'diag-4',
    category: 'AI diagram',
    text: 'Engineering team organization chart and tech lead hierarchy',
    icon: GitFork,
    suggestedType: 'orgchart'
  },

  // AI brainstorming
  {
    id: 'brain-1',
    category: 'AI brainstorming',
    text: 'How to hold an animal-themed birthday party for kids',
    icon: Cake,
    suggestedType: 'timeline'
  },
  {
    id: 'brain-2',
    category: 'AI brainstorming',
    text: 'AI automation opportunities in customer support and ticketing',
    icon: Lightbulb,
    suggestedType: 'mindmap'
  },
  {
    id: 'brain-3',
    category: 'AI brainstorming',
    text: 'Sustainable green packaging materials pros and cons',
    icon: Package,
    suggestedType: 'comparison'
  },
  {
    id: 'brain-4',
    category: 'AI brainstorming',
    text: 'Viral creator economy revenue models and monetization funnel',
    icon: TrendingUp,
    suggestedType: 'infographic'
  }
];

const CATEGORIES = [
  { id: 'Project management', label: 'Project management', icon: Briefcase },
  { id: 'AI planning', label: 'AI planning', icon: CheckSquare },
  { id: 'AI summary', label: 'AI summary', icon: FileText },
  { id: 'AI design', label: 'AI design', icon: PenTool },
  { id: 'AI diagram', label: 'AI diagram', icon: GitFork },
  { id: 'AI brainstorming', label: 'AI brainstorming', icon: Lightbulb }
];

export const AiPromptGeneratorModal: React.FC = () => {
  const {
    isPromptGeneratorOpen,
    setIsPromptGeneratorOpen,
    generateFromAiPrompt
  } = useDiagramStore();

  const [activeCategory, setActiveCategory] = useState<string>('Project management');
  const [promptInput, setPromptInput] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [shuffleSeed, setShuffleSeed] = useState<number>(0);

  if (!isPromptGeneratorOpen) return null;

  const config = getStoredAIConfig();
  const hasGroqKey = !!(
    (config.provider === 'groq' && config.apiKey) ||
    localStorage.getItem('kuvix_groq_api_key')
  );

  // Filter and shuffle prompts for the active category
  const categoryPrompts = ALL_PROMPTS.filter(
    p => activeCategory === 'all' || p.category === activeCategory
  );
  // Deterministic shuffle using seed
  const displayPrompts = [...categoryPrompts]
    .sort((a, b) => {
      const hashA = (a.id.charCodeAt(0) + shuffleSeed) % 17;
      const hashB = (b.id.charCodeAt(0) + shuffleSeed) % 17;
      return hashA - hashB;
    })
    .slice(0, 8);

  const handleGenerate = async (promptToUse?: string) => {
    const finalPrompt = (promptToUse || promptInput).trim();
    if (!finalPrompt || isGenerating) return;

    setIsGenerating(true);
    try {
      await generateFromAiPrompt(finalPrompt, activeCategory);
    } catch (err) {
      console.error('Failed to generate diagram structure:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-slate-100">
        
        {/* Top Header & Category Tabs (Matching Reference Image) */}
        <div className="border-b border-slate-800/80 px-4 sm:px-6 pt-5 pb-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-glow">
                <Zap size={18} className="fill-current text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white tracking-tight">KUVIX Structure Synthesizer</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                    <Sparkles size={10} /> Groq LPU AI
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {hasGroqKey
                    ? 'Connected to Groq Llama 3.3 70B high-speed inference'
                    : 'Operating with intelligent local engine • Add your Groq API key in Settings for cloud models'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsPromptGeneratorOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const IconComp = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <IconComp size={14} className={isActive ? 'text-amber-300' : 'text-slate-400'} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Body: Two-Column Split (Left Generator, Right Visual Blueprint) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 sm:p-6 bg-gradient-to-b from-slate-900 to-slate-950">
          
          {/* Left Column: Generator Form & Example Prompts */}
          <div className="lg:col-span-7 flex flex-col space-y-5">
            {/* Generator Hero Card */}
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-2">
                <span>AI-Powered</span>
                <Sparkles size={11} className="text-amber-300" />
              </div>

              <h3 className="text-xl font-extrabold text-white tracking-tight mb-1.5">
                Diagram & Flowchart Generator
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Enter any one sentence to produce a complete visual diagram, automatically structure concepts, steps, and decision gates, and open directly on your interactive canvas.
              </p>

              {/* Input Prompt Box with Submit Arrow */}
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleGenerate();
                  }}
                  placeholder="Please generate a flowchart for..."
                  className="w-full bg-slate-950/80 border border-purple-500/40 rounded-xl pl-4 pr-12 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 shadow-inner"
                  disabled={isGenerating}
                />

                <button
                  onClick={() => handleGenerate()}
                  disabled={!promptInput.trim() || isGenerating}
                  className="absolute right-2 p-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white rounded-lg shadow-md transition-all flex items-center justify-center cursor-pointer"
                  title="Generate Structure"
                >
                  {isGenerating ? (
                    <Loader2 size={16} className="animate-spin text-white" />
                  ) : (
                    <ArrowRight size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* Example Prompts Grid with Shuffle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={13} className="text-purple-400" />
                  Example Prompts
                </span>

                <button
                  onClick={() => setShuffleSeed(prev => prev + 1)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 px-2.5 py-1 rounded-lg border border-purple-500/20 transition-colors"
                >
                  <Shuffle size={12} />
                  <span>Shuffle</span>
                </button>
              </div>

              {/* 8 Clickable Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {displayPrompts.map((preset) => {
                  const IconComponent = preset.icon;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setPromptInput(preset.text);
                        handleGenerate(preset.text);
                      }}
                      disabled={isGenerating}
                      className="group p-3 bg-slate-800/40 hover:bg-purple-900/20 border border-slate-700/50 hover:border-purple-500/40 rounded-xl text-left transition-all flex items-center justify-between gap-2.5"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-slate-700/50 group-hover:bg-purple-600/30 text-purple-400 flex items-center justify-center shrink-0 transition-colors">
                          <IconComponent size={14} />
                        </div>
                        <span className="text-xs text-slate-300 group-hover:text-white line-clamp-2 leading-snug">
                          {preset.text}
                        </span>
                      </div>

                      <div className="w-5 h-5 rounded-md bg-slate-700/40 group-hover:bg-purple-600 group-hover:text-white text-slate-400 flex items-center justify-center text-xs shrink-0 transition-colors">
                        +
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Live Visual Topology Blueprint */}
          <div className="lg:col-span-5 flex flex-col bg-slate-950/60 border border-slate-800 rounded-2xl p-5 relative overflow-hidden justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Visual Architecture Blueprint
                </span>
                <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                  {promptInput ? 'Custom Concept' : 'Preview Blueprint'}
                </span>
              </div>

              {/* Animated Interactive Flow Diagram Topology Mock */}
              <div className="space-y-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold shadow-md shadow-purple-500/30">
                    User Concept Request
                  </div>
                  <div className="h-0.5 w-6 bg-slate-600" />
                  <div className="px-3.5 py-2 rounded-xl bg-slate-800 border border-purple-500/40 text-purple-300 text-xs font-semibold">
                    Groq Intent Analysis
                  </div>
                </div>

                <div className="flex justify-center my-1">
                  <div className="w-0.5 h-6 bg-slate-600" />
                </div>

                {/* Decision Branch */}
                <div className="flex items-center justify-center gap-3">
                  <div className="w-24 h-24 rotate-45 bg-purple-950/70 border-2 border-purple-500 flex items-center justify-center text-center shadow-glow">
                    <span className="-rotate-45 text-[10px] font-bold text-purple-200">
                      Decision Gate?
                    </span>
                  </div>
                </div>

                <div className="flex justify-center my-1">
                  <div className="w-0.5 h-6 bg-slate-600" />
                </div>

                {/* Sub-processes */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                    <span className="text-[11px] font-semibold text-slate-300 block">Workflow Branch</span>
                    <span className="text-[9px] text-slate-500">Auto-connected paths</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                    <span className="text-[11px] font-semibold text-slate-300 block">Deliverable Outcome</span>
                    <span className="text-[9px] text-slate-500">Live on vector canvas</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Status & Direct Action */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-[11px]">
                <CheckCircle2 size={13} className="text-emerald-400" />
                Instant canvas generation
              </span>

              <button
                onClick={() => {
                  setPromptInput('Customer onboarding decision flow with KYC verification');
                  handleGenerate('Customer onboarding decision flow with KYC verification');
                }}
                disabled={isGenerating}
                className="text-purple-400 hover:text-purple-300 font-semibold text-xs hover:underline flex items-center gap-1"
              >
                <span>Try Quick Demo</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
