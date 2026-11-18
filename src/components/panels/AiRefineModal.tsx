import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Plus,
  GitFork,
  FileText,
  Zap,
  AlertTriangle,
  Tag,
  HelpCircle,
  Loader2
} from 'lucide-react';
import { useDiagramStore } from '../../store/useDiagramStore';
import { getStoredAIConfig } from '../../engine/aiProvider';

const QUICK_PROMPTS = [
  {
    icon: ShieldCheck,
    label: 'Make this more professional',
    desc: 'Upgrades terminology to executive/enterprise standards and enhances descriptions.'
  },
  {
    icon: HelpCircle,
    label: 'Explain each component',
    desc: 'Adds detailed functional operations and descriptions to every component.'
  },
  {
    icon: Tag,
    label: 'Highlight important components',
    desc: 'Accents critical path nodes with high-visibility borders and custom badges.'
  },
  {
    icon: AlertTriangle,
    label: 'Add error-handling paths',
    desc: 'Adds failover recovery branches and conditional exception paths.'
  },
  {
    icon: GitFork,
    label: 'Convert this into a decision tree',
    desc: 'Morphs stages into branching conditional decision diamonds with Yes/No branches.'
  },
  {
    icon: Plus,
    label: 'Add more steps',
    desc: 'Inserts quality assurance and governance verification checkpoints.'
  },
  {
    icon: FileText,
    label: 'Simplify explanations',
    desc: 'Condenses node text into crisp, high-impact bullet takeaways.'
  },
  {
    icon: Zap,
    label: 'Add high-visibility icons',
    desc: 'Maps modern contextual symbols to every node in the visual.'
  }
];

export const AiRefineModal: React.FC = () => {
  const {
    isAiRefineOpen,
    setIsAiRefineOpen,
    refineWithPrompt,
    selectedNodeId,
    currentProject
  } = useDiagramStore();
  const [promptValue, setPromptValue] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  if (!isAiRefineOpen) return null;

  const config = getStoredAIConfig();
  const envGroqKey = (import.meta.env.VITE_GROQ_API_KEY as string | undefined)?.trim();
  const hasGroqKey = !!(
    (config.provider === 'groq' && config.apiKey) ||
    envGroqKey ||
    localStorage.getItem('kuvix_groq_api_key')
  );

  const selectedNode = currentProject.nodes.find(n => n.id === selectedNodeId);

  const handleSubmit = async (promptText: string) => {
    if (!promptText.trim() || isRefining) return;
    setIsRefining(true);
    try {
      await refineWithPrompt(promptText.trim(), selectedNodeId || undefined);
      setPromptValue('');
    } catch (err) {
      console.error('Failed to refine diagram:', err);
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center shadow-glow">
              <Sparkles size={20} className="fill-current text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">AI Visual Refinement</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                  <Sparkles size={10} /> {hasGroqKey ? 'Groq LPU Powered' : 'Smart Local Engine'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {hasGroqKey
                  ? 'Intelligently updates diagram structure, text, and visual connections via Groq AI'
                  : 'Transform or enhance your diagram using natural language prompts'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAiRefineOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Prompt Input Form */}
        <div className="p-5">
          {selectedNode && (
            <div className="mb-3.5 p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs flex items-center justify-between text-blue-900">
              <span>
                Targeting selected component: <strong>"{selectedNode.data.title}"</strong>
              </span>
              <span className="text-[10px] bg-blue-200/80 text-blue-800 px-2 py-0.5 rounded-md font-semibold">
                Partial Edit Mode
              </span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(promptValue);
            }}
            className="flex items-center gap-2 mb-4"
          >
            <input
              type="text"
              autoFocus
              value={promptValue}
              disabled={isRefining}
              onChange={(e) => setPromptValue(e.target.value)}
              placeholder="e.g. Add a QA testing stage, make concise, or add approval gate..."
              className="flex-1 px-4 py-2.5 text-sm border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl outline-none disabled:bg-slate-50"
            />
            <button
              type="submit"
              disabled={!promptValue.trim() || isRefining}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              {isRefining ? (
                <>
                  <Loader2 size={15} className="animate-spin text-white" />
                  <span>Refining...</span>
                </>
              ) : (
                <>
                  <span>Apply</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Quick Preset Prompts */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Suggested AI Transformations
            </span>

            {QUICK_PROMPTS.map((qp, idx) => {
              const IconComp = qp.icon;
              return (
                <div
                  key={idx}
                  onClick={() => !isRefining && handleSubmit(qp.label)}
                  className={`p-3 border rounded-xl transition-all flex items-center justify-between group ${
                    isRefining
                      ? 'opacity-50 cursor-not-allowed border-slate-200'
                      : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-600 flex items-center justify-center transition-colors">
                      <IconComp size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {qp.label}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">
                        {qp.desc}
                      </div>
                    </div>
                  </div>

                  <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

