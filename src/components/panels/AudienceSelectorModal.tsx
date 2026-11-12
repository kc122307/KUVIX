import React from 'react';
import {
  X,
  Users,
  Smile,
  GraduationCap,
  Code2,
  TrendingUp,
  Briefcase,
  HeartHandshake,
  Check,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useDiagramStore } from '../../store/useDiagramStore';
import { AUDIENCE_PRESETS } from '../../engine/audienceTransformer';
import { AudienceType } from '../../types/source';

export const AudienceSelectorModal: React.FC = () => {
  const {
    currentProject,
    isAudienceSelectorOpen,
    setIsAudienceSelectorOpen,
    transformAudience
  } = useDiagramStore();

  if (!isAudienceSelectorOpen) return null;

  const currentAudience = currentProject.activeAudience || 'technical';

  const iconMap: Record<string, React.ElementType> = {
    Smile,
    GraduationCap,
    Code2,
    TrendingUp,
    Briefcase,
    HeartHandshake
  };

  const handleSelect = (audience: AudienceType) => {
    transformAudience(audience);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-glow">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                One Idea, Multiple Audiences
              </h2>
              <p className="text-xs text-slate-500">
                Instantly adjust diagram complexity and terminology while preserving core facts
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAudienceSelectorOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Choose Target Audience Persona
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {AUDIENCE_PRESETS.map(preset => {
              const IconComp = iconMap[preset.icon] || Users;
              const isSelected = currentAudience === preset.id;

              return (
                <div
                  key={preset.id}
                  onClick={() => handleSelect(preset.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-500 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${
                    isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <IconComp size={16} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-xs font-bold text-slate-900">
                        {preset.name}
                      </h4>
                      {isSelected && <Check size={14} className="text-purple-600" />}
                    </div>
                    <span className="text-[9px] font-bold tracking-wide uppercase px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                      {preset.badgeLabel}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      {preset.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 p-3 bg-purple-50/50 border border-purple-200/80 rounded-xl text-xs text-purple-900 flex items-center gap-2">
            <Sparkles size={14} className="text-purple-600 shrink-0" />
            <span>
              Preserves all node connections and positions while tailoring language, subtitles, and badges.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={() => setIsAudienceSelectorOpen(false)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

