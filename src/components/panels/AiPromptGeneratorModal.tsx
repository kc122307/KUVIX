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
  Music,
  Compass,
  Coffee,
  LucideIcon
} from 'lucide-react';
import { useDiagramStore } from '../../store/useDiagramStore';
import { getStoredAIConfig } from '../../engine/aiProvider';

interface PromptPreset {
  id: string;
  tag: string;
  text: string;
  icon: LucideIcon;
}

const ALL_PROMPTS: PromptPreset[] = [
  {
    id: 'dance-1',
    tag: 'Creative & Arts',
    text: 'Learning dance in three months and performing a routine',
    icon: Music
  },
  {
    id: 'webdev-1',
    tag: 'Education',
    text: 'How to learn web development skill and study plan',
    icon: Code
  },
  {
    id: 'onboarding-1',
    tag: 'Product',
    text: 'Customer onboarding decision flow with KYC verification',
    icon: CheckSquare
  },
  {
    id: 'fitness-1',
    tag: 'Health',
    text: '12-week marathon training and progressive overload guide',
    icon: Activity
  },
  {
    id: 'roadmap-1',
    tag: 'Strategy',
    text: 'Quarterly product launch roadmap for SaaS platform',
    icon: Briefcase
  },
  {
    id: 'coffee-1',
    tag: 'Business',
    text: 'Coffee shop launch: from bean sourcing to grand opening',
    icon: Coffee
  },
  {
    id: 'microservices-1',
    tag: 'Engineering',
    text: 'Microservices architecture with API Gateway, gRPC, and Redis',
    icon: Layers
  },
  {
    id: 'devops-1',
    tag: 'DevOps',
    text: 'DevOps continuous integration and automated deployment flywheel',
    icon: Workflow
  },
  {
    id: 'marketing-1',
    tag: 'Marketing',
    text: 'Marketing research on the skincare industry',
    icon: TrendingUp
  },
  {
    id: 'tiktok-1',
    tag: 'Social Media',
    text: 'Three most popular topics and live shopping strategy on TikTok Shop',
    icon: ShoppingBag
  },
  {
    id: 'packaging-1',
    tag: 'Design',
    text: 'Developing visual concepts for a new sustainable packaging design',
    icon: Package
  },
  {
    id: 'party-1',
    tag: 'Events',
    text: 'How to hold an animal-themed birthday party for kids',
    icon: Cake
  },
  {
    id: 'ai-ops-1',
    tag: 'Operations',
    text: 'AI automation opportunities in customer support and ticketing',
    icon: Lightbulb
  },
  {
    id: 'mobile-app-1',
    tag: 'Engineering',
    text: 'How to learn basic coding for app development and launch',
    icon: Smartphone
  },
  {
    id: 'design-system-1',
    tag: 'UI/UX',
    text: 'Design system tokens and UI component hierarchy',
    icon: PenTool
  },
  {
    id: 'auth-flow-1',
    tag: 'Security',
    text: 'SaaS user authentication and OAuth 2.0 token verification path',
    icon: GitFork
  }
];

const QUICK_PILLS = [
  { label: '💃 Learning Dance', prompt: 'Learning dance in three months and performing a routine' },
  { label: '🚀 SaaS Launch', prompt: 'Quarterly product launch roadmap for SaaS platform' },
  { label: '💻 Web Dev Plan', prompt: 'How to learn web development skill and study plan' },
  { label: '⚡ DevOps Flywheel', prompt: 'DevOps continuous integration and automated deployment flywheel' },
  { label: '☕ Coffee Shop', prompt: 'Coffee shop launch: from bean sourcing to grand opening' },
  { label: '🏃 12-Week Marathon', prompt: '12-week marathon training and progressive overload guide' }
];

export const AiPromptGeneratorModal: React.FC = () => {
  const {
    isPromptGeneratorOpen,
    setIsPromptGeneratorOpen,
    generateFromAiPrompt
  } = useDiagramStore();

  const [promptInput, setPromptInput] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [displayPrompts, setDisplayPrompts] = useState<PromptPreset[]>(() =>
    [...ALL_PROMPTS].sort(() => 0.5 - Math.random()).slice(0, 8)
  );

  if (!isPromptGeneratorOpen) return null;

  const config = getStoredAIConfig();
  const envGroqKey = (import.meta.env.VITE_GROQ_API_KEY as string | undefined)?.trim();
  const hasGroqKey = !!(
    (config.provider === 'groq' && config.apiKey) ||
    envGroqKey ||
    localStorage.getItem('kuvix_groq_api_key')
  );

  const handleShuffle = () => {
    setDisplayPrompts([...ALL_PROMPTS].sort(() => 0.5 - Math.random()).slice(0, 8));
  };

  const handleGenerate = async (promptToUse?: string) => {
    const finalPrompt = (promptToUse || promptInput).trim();
    if (!finalPrompt || isGenerating) return;

    setIsGenerating(true);
    try {
      await generateFromAiPrompt(finalPrompt);
    } catch (err) {
      console.error('Failed to generate diagram structure:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-5xl max-h-[96vh] sm:max-h-[92vh] flex flex-col overflow-hidden text-slate-900">
        
        {/* Top Header: Clean & Streamlined */}
        <div className="border-b border-slate-100 px-4 sm:px-6 py-4 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-glow shrink-0">
              <Zap size={18} className="fill-current text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate">
                  AI Diagram Synthesizer
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1 shrink-0">
                  <Sparkles size={10} /> Groq LPU AI
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                {hasGroqKey
                  ? `Connected to Groq LPU AI (${config.model || 'openai/gpt-oss-120b'}) inference`
                  : 'Operating with intelligent local engine • Add your Groq API key in Settings for cloud models'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPromptGeneratorOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors shrink-0 ml-2"
          >
            <X size={18} />
          </button>
        </div>

        {/* Main Body: Two-Column Split (Left Unified Generator, Right Visual Blueprint) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 p-4 sm:p-6 bg-slate-50/70">
          
          {/* Left Column: Unified Generator & Shuffleable Ideas */}
          <div className="lg:col-span-7 flex flex-col space-y-4 sm:space-y-5">
            {/* Hero Input Card */}
            <div className="bg-white border border-purple-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xs ring-1 ring-purple-50">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 mb-2">
                <span>AI Concept to Visual Canvas</span>
                <Sparkles size={11} className="text-amber-500" />
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mb-1">
                What would you like to visualize?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-3.5">
                Type any idea, curriculum, workflow, or system. KUVIX deeply analyzes your domain and synthesizes a complete interactive diagram.
              </p>

              {/* Input Prompt Box with Submit Arrow */}
              <div className="relative flex items-center mb-3">
                <input
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleGenerate();
                  }}
                  placeholder="e.g. Learning dance in three months, SaaS onboarding, Coffee shop launch..."
                  className="w-full bg-slate-50/80 border border-purple-200 rounded-xl pl-3.5 sm:pl-4 pr-11 sm:pr-12 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 shadow-xs focus:bg-white transition-all"
                  disabled={isGenerating}
                />

                <button
                  onClick={() => handleGenerate()}
                  disabled={!promptInput.trim() || isGenerating}
                  className="absolute right-1.5 sm:right-2 p-1.5 sm:p-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-40 text-white rounded-lg shadow-md transition-all flex items-center justify-center cursor-pointer"
                  title="Generate Visual Diagram"
                >
                  {isGenerating ? (
                    <Loader2 size={16} className="animate-spin text-white" />
                  ) : (
                    <ArrowRight size={16} />
                  )}
                </button>
              </div>

              {/* Quick Suggestion Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider shrink-0 mr-1 flex items-center gap-1">
                  <Compass size={11} /> Quick:
                </span>
                {QUICK_PILLS.map((pill, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPromptInput(pill.prompt);
                      handleGenerate(pill.prompt);
                    }}
                    disabled={isGenerating}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-900 transition-colors shrink-0 whitespace-nowrap"
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Inspiration Ideas Grid with Shuffle Button */}
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={13} className="text-purple-600" />
                  Inspiration Ideas
                </span>

                <button
                  onClick={handleShuffle}
                  className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-200 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Shuffle size={13} className="text-purple-600" />
                  <span>Shuffle Ideas</span>
                </button>
              </div>

              {/* 8 Clickable Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
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
                      className="group p-2.5 sm:p-3 bg-white hover:bg-purple-50/50 border border-slate-200 hover:border-purple-300 rounded-xl text-left transition-all shadow-xs hover:shadow-subtle flex items-center justify-between gap-2.5"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 group-hover:bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 transition-colors">
                          <IconComponent size={15} />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-semibold text-purple-600 uppercase tracking-wider block mb-0.5">
                            {preset.tag}
                          </span>
                          <span className="text-xs text-slate-800 group-hover:text-purple-900 line-clamp-2 leading-snug font-medium">
                            {preset.text}
                          </span>
                        </div>
                      </div>

                      <div className="w-5 h-5 rounded-md bg-slate-100 group-hover:bg-purple-600 group-hover:text-white text-slate-500 flex items-center justify-center text-xs shrink-0 transition-colors">
                        +
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Live Visual Topology Blueprint */}
          <div className="lg:col-span-5 flex flex-col bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xs justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Visual Architecture Blueprint
                </span>
                <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                  {promptInput ? 'Custom Concept' : 'Live Preview'}
                </span>
              </div>

              {/* Animated Interactive Flow Diagram Topology Mock */}
              <div className="space-y-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-purple-500/20">
                    User Concept Request
                  </div>
                  <div className="h-0.5 w-6 bg-slate-300" />
                  <div className="px-3.5 py-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-semibold">
                    Groq Intent Analysis
                  </div>
                </div>

                <div className="flex justify-center my-1">
                  <div className="w-0.5 h-6 bg-slate-300" />
                </div>

                {/* Decision Branch */}
                <div className="flex items-center justify-center gap-3">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rotate-45 bg-amber-50 border-2 border-amber-400 flex items-center justify-center text-center shadow-xs">
                    <span className="-rotate-45 text-[10px] font-bold text-amber-900">
                      Decision Gate?
                    </span>
                  </div>
                </div>

                <div className="flex justify-center my-1">
                  <div className="w-0.5 h-6 bg-slate-300" />
                </div>

                {/* Sub-processes */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[11px] font-bold text-slate-800 block">Workflow Branch</span>
                    <span className="text-[9px] text-slate-500">Auto-connected paths</span>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[11px] font-bold text-slate-800 block">Deliverable Outcome</span>
                    <span className="text-[9px] text-slate-500">Live on vector canvas</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Status & Direct Action */}
            <div className="mt-5 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100 flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 text-[11px]">
                <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                Instant canvas generation
              </span>

              <button
                onClick={() => {
                  setPromptInput('Customer onboarding decision flow with KYC verification');
                  handleGenerate('Customer onboarding decision flow with KYC verification');
                }}
                disabled={isGenerating}
                className="text-purple-600 hover:text-purple-800 font-semibold text-xs hover:underline flex items-center justify-center gap-1"
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
