import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Sparkles,
  Layers,
  MonitorPlay
} from 'lucide-react';
import { useDiagramStore } from '../../store/useDiagramStore';
import { getThemeById } from '../../engine/themes';
import { IconRenderer } from '../canvas/IconRenderer';

export const PresentationModal: React.FC = () => {
  const {
    isPresentationOpen,
    setIsPresentationOpen,
    currentProject
  } = useDiagramStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const theme = getThemeById(currentProject.themeId);
  const nodes = currentProject.nodes;

  useEffect(() => {
    if (!isPresentationOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        setCurrentIndex(prev => (prev < nodes.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentIndex(prev => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Escape') {
        setIsPresentationOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresentationOpen, nodes.length, setIsPresentationOpen]);

  if (!isPresentationOpen || nodes.length === 0) return null;

  const currentNode = nodes[currentIndex] || nodes[0];
  const progressPercent = Math.round(((currentIndex + 1) / nodes.length) * 100);

  return (
    <div
      style={{ backgroundColor: theme.canvasBg }}
      className="fixed inset-0 z-50 flex flex-col justify-between p-8 select-none animate-in fade-in duration-300"
    >
      {/* Top Header Controls */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-glow">
            <MonitorPlay size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">{currentProject.title}</h2>
            <span className="text-[11px] text-slate-500">KUVIX Slides Presentation • Slide {currentIndex + 1} of {nodes.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500 bg-white/80 px-3 py-1 rounded-full border border-slate-200">
            {progressPercent}% Complete
          </span>
          <button
            onClick={() => setIsPresentationOpen(false)}
            className="p-2 bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200 shadow-xs transition-colors"
            title="Exit Presentation (Esc)"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Slide Card Centerpiece */}
      <div className="flex-1 flex items-center justify-center my-6">
        <div
          style={{
            backgroundColor: currentNode.data.customBg || theme.nodeBg,
            borderColor: currentNode.data.customBorder || theme.accent,
            color: currentNode.data.customText || theme.nodeText
          }}
          className="w-full max-w-2xl p-10 md:p-12 rounded-3xl border-2 shadow-2xl transition-all duration-300 relative flex flex-col justify-between min-h-[380px]"
        >
          {/* Top Bar of Slide */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {currentNode.data.icon && (
                <div
                  style={{
                    backgroundColor: theme.badgeBg,
                    color: theme.badgeText
                  }}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-subtle"
                >
                  <IconRenderer name={currentNode.data.icon} size={28} />
                </div>
              )}

              {currentNode.data.badge && (
                <span
                  style={{
                    backgroundColor: theme.badgeBg,
                    color: theme.badgeText
                  }}
                  className="text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full"
                >
                  {currentNode.data.badge}
                </span>
              )}
            </div>

            <span className="text-sm font-mono font-bold opacity-60">
              #{currentIndex + 1}
            </span>
          </div>

          {/* Title & Description */}
          <div className="space-y-4 my-auto">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              {currentNode.data.title}
            </h1>

            {currentNode.data.subtitle && (
              <p
                style={{ color: theme.nodeSubtext }}
                className="text-lg md:text-xl leading-relaxed opacity-90"
              >
                {currentNode.data.subtitle}
              </p>
            )}

            {currentNode.data.stats && (
              <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-sm font-semibold text-blue-600">
                <Sparkles size={16} />
                <span>{currentNode.data.stats}</span>
              </div>
            )}
          </div>

          {/* Bottom Slide Meta */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Use Left / Right arrow keys to navigate</span>
            <span className="capitalize">{currentProject.diagramType} Layout</span>
          </div>
        </div>
      </div>

      {/* Bottom Progress Bar & Navigation Controls */}
      <div className="flex items-center justify-between z-10 max-w-2xl mx-auto w-full gap-4">
        <button
          onClick={() => setCurrentIndex(prev => (prev > 0 ? prev - 1 : prev))}
          disabled={currentIndex === 0}
          className="flex items-center gap-1.5 px-4 py-2 bg-white/90 hover:bg-white disabled:opacity-30 text-slate-800 rounded-xl border border-slate-200 shadow-xs font-semibold text-xs transition-all"
        >
          <ChevronLeft size={16} />
          <span>Previous</span>
        </button>

        {/* Dots Indicator */}
        <div className="flex items-center gap-1.5">
          {nodes.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              style={{
                backgroundColor: idx === currentIndex ? theme.accent : '#cbd5e1'
              }}
              className={`h-2 rounded-full transition-all ${
                idx === currentIndex ? 'w-8' : 'w-2 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentIndex(prev => (prev < nodes.length - 1 ? prev + 1 : prev))}
          disabled={currentIndex === nodes.length - 1}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white rounded-xl shadow-xs font-semibold text-xs transition-all"
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

