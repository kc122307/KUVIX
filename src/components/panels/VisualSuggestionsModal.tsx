import React, { useMemo } from 'react';
import {
  X,
  Zap,
  ArrowRight,
  GitBranch,
  Network,
  Milestone,
  RotateCw,
  LayoutGrid,
  Columns3,
  FolderTree,
  Check
} from 'lucide-react';
import { useDiagramStore } from '../../store/useDiagramStore';
import { parseTextToDocument } from '../../engine/nlpParser';
import { DiagramType } from '../../types/diagram';

const ICON_MAP = {
  ArrowRight,
  GitBranch,
  Network,
  Milestone,
  RotateCw,
  LayoutGrid,
  Columns3,
  FolderTree
};

export const VisualSuggestionsModal: React.FC = () => {
  const {
    currentProject,
    isSuggestionsOpen,
    setIsSuggestionsOpen,
    generateFromText
  } = useDiagramStore();

  const parsedDoc = useMemo(() => {
    return parseTextToDocument(currentProject.documentText);
  }, [currentProject.documentText]);

  if (!isSuggestionsOpen) return null;

  const handleSelectFormat = (type: DiagramType) => {
    generateFromText(type);
    setIsSuggestionsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-glow">
              <Zap size={22} className="fill-current text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">KUVIX Visual Formats</h2>
              <p className="text-xs text-slate-500">
                AI analyzed {parsedDoc.entities.length} concepts from your text. Choose a visual structure:
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSuggestionsOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Carousel / Card Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {parsedDoc.suggestedVisuals.map((sugg) => {
            const IconComponent = ICON_MAP[sugg.iconName as keyof typeof ICON_MAP] || GitBranch;
            const isCurrent = currentProject.diagramType === sugg.type;

            return (
              <div
                key={sugg.type}
                onClick={() => handleSelectFormat(sugg.type)}
                className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between group hover:shadow-elevated ${
                  isCurrent
                    ? 'border-blue-600 bg-blue-50/30'
                    : 'border-slate-200 hover:border-blue-400 bg-white'
                }`}
              >
                <div>
                  {/* Top Badge: Confidence & Current */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      {sugg.confidence}% Match
                    </span>

                    {isCurrent && (
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check size={11} /> ACTIVE
                      </span>
                    )}
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-700 flex items-center justify-center transition-colors">
                      <IconComponent size={18} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {sugg.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {sugg.description}
                  </p>
                </div>

                {/* Footer Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                  <span>Generate format</span>
                  <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>You can switch visual styles and themes anytime without losing your content.</span>
          <button
            onClick={() => setIsSuggestionsOpen(false)}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

