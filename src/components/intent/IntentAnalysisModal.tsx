import React, { useState } from 'react';
import {
  X,
  Compass,
  Sparkles,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  GitBranch,
  Server,
  Network,
  Smile,
  AlertTriangle,
  Lightbulb,
  Check
} from 'lucide-react';
import { useDiagramStore } from '../../store/useDiagramStore';
import { INTENT_PRESETS, analyzeUserIntent } from '../../engine/intentAnalyzer';
import { DiagramType } from '../../types/diagram';
import { AudienceType } from '../../types/source';

export const IntentAnalysisModal: React.FC = () => {
  const {
    currentProject,
    isIntentAnalysisOpen,
    setIsIntentAnalysisOpen,
    generateFromText,
    transformAudience,
    refineWithPrompt
  } = useDiagramStore();

  const [selectedPresetId, setSelectedPresetId] = useState<string>(INTENT_PRESETS[0].id);
  const [customInstruction, setCustomInstruction] = useState<string>('');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isIntentAnalysisOpen) return null;

  const currentPreset = INTENT_PRESETS.find(p => p.id === selectedPresetId) || INTENT_PRESETS[0];
  const activeInstruction = customInstruction.trim() || currentPreset.instruction;

  // Run intent analysis on current content and instruction
  const analysis = analyzeUserIntent(
    currentProject.documentText,
    activeInstruction,
    currentProject.sources || []
  );

  const handleApplyIntent = () => {
    setIsGenerating(true);
    try {
      // 1. Generate diagram with recommended diagram type
      generateFromText(analysis.recommendedDiagramType as DiagramType);

      // 2. Transform for recommended audience
      transformAudience(analysis.recommendedAudience as AudienceType);

      // 3. Apply custom instructions if provided
      if (customInstruction.trim()) {
        refineWithPrompt(customInstruction.trim());
      }

      setIsIntentAnalysisOpen(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const iconMap: Record<string, React.ElementType> = {
    Lightbulb,
    GitBranch,
    Server,
    Network,
    Smile,
    AlertTriangle
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-glow">
              <Compass size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Intelligent User Intent Analysis
              </h2>
              <p className="text-xs text-slate-500">
                Align diagram topology, depth, and audience with your specific communication goals
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsIntentAnalysisOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Preset Intent Cards */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Select Intent Archetype
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {INTENT_PRESETS.map(preset => {
                const IconComp = iconMap[preset.icon] || Lightbulb;
                const isSelected = selectedPresetId === preset.id && !customInstruction.trim();

                return (
                  <div
                    key={preset.id}
                    onClick={() => {
                      setSelectedPresetId(preset.id);
                      setCustomInstruction('');
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-500 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <IconComp size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 mb-0.5">
                        {preset.label}
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Instruction Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Or Provide Custom Intent Instructions
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Focus specifically on the API gateway and security layers, and highlight failover paths..."
              value={customInstruction}
              onChange={(e) => setCustomInstruction(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none resize-none"
            />
          </div>

          {/* Clarifying Questions Section */}
          {analysis.clarifyingQuestions.length > 0 && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <HelpCircle size={15} className="text-blue-600" />
                <span>Clarifying Decision Points</span>
              </div>
              <p className="text-[11px] text-slate-500">
                To tailor the visual with precision, select your preferences below:
              </p>

              <div className="space-y-3 pt-1">
                {analysis.clarifyingQuestions.map(q => {
                  const currentSelected = selectedAnswers[q.id] || q.selectedOption;
                  return (
                    <div key={q.id} className="text-xs space-y-1.5">
                      <span className="font-semibold text-slate-800 block">
                        {q.question}
                      </span>
                      <div className="grid grid-cols-1 gap-1.5">
                        {q.options.map((opt, oIdx) => (
                          <label
                            key={oIdx}
                            className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                              currentSelected === opt
                                ? 'bg-blue-50 border-blue-400 text-blue-900 font-medium'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              value={opt}
                              checked={currentSelected === opt}
                              onChange={() => setSelectedAnswers(prev => ({ ...prev, [q.id]: opt }))}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Intent Summary Box */}
          <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block mb-0.5">
                Generation Blueprint
              </span>
              <p className="text-slate-800 font-medium">
                {analysis.intentSummary}
              </p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                <span>Diagram Type: <strong className="capitalize text-slate-700">{analysis.recommendedDiagramType}</strong></span>
                <span>•</span>
                <span>Target Audience: <strong className="capitalize text-slate-700">{analysis.recommendedAudience}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => setIsIntentAnalysisOpen(false)}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleApplyIntent}
            disabled={isGenerating}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-glow flex items-center gap-2 transition-all"
          >
            <Sparkles size={14} className="fill-current text-amber-300" />
            <span>{isGenerating ? 'Generating Visual...' : 'Generate Tailored Diagram'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

