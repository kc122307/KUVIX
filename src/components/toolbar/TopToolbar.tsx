import React, { useState } from 'react';
import {
  Zap,
  Undo2,
  Redo2,
  Download,
  Sparkles,
  Sliders,
  Settings,
  Check,
  RefreshCw,
  ChevronDown,
  MonitorPlay,
  Maximize,
  Share2,
  Compass,
  ShieldCheck,
  Wand2,
  MoreHorizontal
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useDiagramStore } from '../../store/useDiagramStore';
import { AspectRatio } from '../../types/diagram';
import { generateShareableUrl } from '../../services/storage';

interface TopToolbarProps {
  isPropertiesOpen: boolean;
  onToggleProperties: () => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
  isPropertiesOpen,
  onToggleProperties
}) => {
  const {
    currentProject,
    updateProjectTitle,
    undo,
    redo,
    canUndo,
    canRedo,
    isAutoSaving,
    setActiveView,
    setIsAiRefineOpen,
    setIsExportOpen,
    setIsSettingsOpen,
    setIsPresentationOpen,
    setIsIntentAnalysisOpen,
    setIsCheckerOpen,
    setIsPromptGeneratorOpen,
    setAspectRatio,
    lastAiFeedback
  } = useDiagramStore();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(currentProject.title);
  const [isRatioMenuOpen, setIsRatioMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isShared, setIsShared] = useState(false);

  const handleShare = async () => {
    try {
      const url = generateShareableUrl(currentProject);
      await navigator.clipboard.writeText(url);
      setIsShared(true);
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.2 } });
      setTimeout(() => setIsShared(false), 2500);
    } catch (err) {
      console.error('Failed to copy share link:', err);
    }
  };

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleValue.trim()) {
      updateProjectTitle(titleValue.trim());
    } else {
      setTitleValue(currentProject.title);
    }
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-2 sm:px-4 flex items-center justify-between z-20 shadow-xs relative">
      {/* Left: Brand & Project Name */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        <button
          onClick={() => setActiveView('dashboard')}
          className="flex items-center gap-2 group p-1 -ml-1 sm:p-1.5 sm:-ml-1.5 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
          title="Return to Projects Dashboard"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
            <Zap size={18} className="fill-current text-amber-300" />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold tracking-tight text-slate-900 leading-none">KUVIX</span>
            <span className="text-[10px] text-blue-600 font-medium leading-tight">Words into worlds.</span>
          </div>
        </button>

        <div className="h-5 w-px bg-slate-200 hidden sm:block shrink-0" />

        {/* Project Title Editor */}
        <div className="flex items-center gap-1 min-w-0">
          {isEditingTitle ? (
            <input
              type="text"
              autoFocus
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSubmit();
                if (e.key === 'Escape') setIsEditingTitle(false);
              }}
              className="text-xs sm:text-sm font-semibold px-2 py-0.5 border border-blue-400 rounded-lg outline-none bg-blue-50/40 text-slate-900 max-w-[100px] xs:max-w-[140px] sm:max-w-xs"
            />
          ) : (
            <button
              onClick={() => {
                setTitleValue(currentProject.title);
                setIsEditingTitle(true);
              }}
              className="text-xs sm:text-sm font-semibold text-slate-800 hover:text-blue-600 px-1.5 sm:px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors max-w-[80px] xs:max-w-[120px] sm:max-w-[180px] md:max-w-xs truncate"
              title="Click to rename project"
            >
              {currentProject.title}
            </button>
          )}

          {/* Auto-save status */}
          <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
            {isAutoSaving ? (
              <span className="flex items-center gap-1 text-blue-500">
                <RefreshCw size={11} className="animate-spin" /> Saving...
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-400">
                <Check size={12} className="text-emerald-500" /> Saved
              </span>
            )}
          </div>
        </div>

        <div className="h-5 w-px bg-slate-200 hidden sm:block shrink-0" />

        {/* Canvas Controls: Undo/Redo, Free Aspect Ratio, Present, Intent, Health, AI Refine */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Undo / Redo */}
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50 shrink-0">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-1 sm:p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 size={14} />
            </button>
            <div className="w-px h-4 bg-slate-200" />
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-1 sm:p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 size={14} />
            </button>
          </div>

          {/* Aspect Ratio Frame Selector (Hidden on mobile, available in More menu) */}
          <div className="relative shrink-0 hidden md:block">
            <button
              onClick={() => setIsRatioMenuOpen(!isRatioMenuOpen)}
              className="flex items-center gap-1 px-2 py-1.5 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              title="Aspect Ratio Frame"
            >
              <Maximize size={13} className="text-slate-500" />
              <span className="uppercase text-[11px] font-semibold">{currentProject.aspectRatio || 'Free'}</span>
              <ChevronDown size={12} className="text-slate-400" />
            </button>

            {isRatioMenuOpen && (
              <div className="absolute left-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-elevated py-1.5 z-50 animate-in fade-in">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Canvas Frame
                </div>
                {(['free', '16:9', '1:1', '4:3'] as AspectRatio[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setAspectRatio(r);
                      setIsRatioMenuOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left flex items-center justify-between text-xs hover:bg-slate-50 transition-colors ${
                      (currentProject.aspectRatio || 'free') === r ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <span className="capitalize">{r === 'free' ? 'Free (Infinite)' : r === '16:9' ? '16:9 (Slides)' : r === '1:1' ? '1:1 (Square)' : '4:3 (Doc)'}</span>
                    {(currentProject.aspectRatio || 'free') === r && <Check size={13} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Present (Slides) Button */}
          <button
            onClick={() => setIsPresentationOpen(true)}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 border border-slate-200 hover:border-blue-400 rounded-lg text-xs font-semibold text-slate-700 hover:bg-blue-50/40 transition-all shrink-0"
            title="KUVIX Slides: Present full screen"
          >
            <MonitorPlay size={14} className="text-blue-600" />
            <span>Present</span>
          </button>

          {/* Intelligent Intent Analyzer */}
          <button
            onClick={() => setIsIntentAnalysisOpen(true)}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 border border-slate-200 hover:border-indigo-400 rounded-lg text-xs font-semibold text-slate-700 hover:bg-indigo-50/30 transition-all cursor-pointer shrink-0"
            title="Intelligent user intent analysis & clarifying questions"
          >
            <Compass size={14} className="text-indigo-600" />
            <span>Intent</span>
          </button>

          {/* Diagram Health Checker */}
          <button
            onClick={() => setIsCheckerOpen(true)}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 border border-slate-200 hover:border-emerald-400 rounded-lg text-xs font-semibold text-slate-700 hover:bg-emerald-50/30 transition-all cursor-pointer shrink-0"
            title="Diagram intelligence checker (linter & diagnostics)"
          >
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Health</span>
          </button>

          {/* AI Refine Button */}
          <button
            onClick={() => setIsAiRefineOpen(true)}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs hover:shadow-glow transition-all shrink-0"
            title="Refine diagram with Natural Language instructions"
          >
            <Sparkles size={13} className="fill-current text-amber-300" />
            <span className="hidden md:inline">AI Refine</span>
          </button>

          {/* AI Prompt-to-Structure Synthesizer */}
          <button
            onClick={() => setIsPromptGeneratorOpen(true)}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg text-xs font-semibold shadow-xs hover:shadow-glow transition-all shrink-0 cursor-pointer"
            title="AI Prompt-to-Diagram: Synthesize complete structure from one sentence with Groq AI"
          >
            <Wand2 size={13} className="text-amber-300" />
            <span className="hidden sm:inline">AI </span><span>Create</span>
          </button>
        </div>
      </div>

      {/* Center: AI Feedback notice if recent */}
      {lastAiFeedback && (
        <div className="hidden 2xl:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs text-emerald-800 max-w-md truncate animate-in fade-in">
          <Sparkles size={12} className="text-emerald-600 shrink-0" />
          <span className="truncate">{lastAiFeedback}</span>
        </div>
      )}

      {/* Right Toolbar Controls: Mobile More Menu, Panel Toggle, Export Actions & Settings */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* Mobile More Options Menu */}
        <div className="relative md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`p-1.5 rounded-lg border transition-colors ${
              isMobileMenuOpen
                ? 'border-blue-500 bg-blue-50 text-blue-600'
                : 'border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            title="More Canvas Tools"
          >
            <MoreHorizontal size={15} />
          </button>

          {isMobileMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-elevated py-1.5 z-50 animate-in fade-in">
              <button
                onClick={() => {
                  setIsPresentationOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left flex items-center gap-2 text-xs text-slate-700 hover:bg-slate-50"
              >
                <MonitorPlay size={14} className="text-blue-600" />
                <span>Present Slides</span>
              </button>

              <button
                onClick={() => {
                  setIsIntentAnalysisOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left flex items-center gap-2 text-xs text-slate-700 hover:bg-slate-50"
              >
                <Compass size={14} className="text-indigo-600" />
                <span>Intent Analyzer</span>
              </button>

              <button
                onClick={() => {
                  setIsCheckerOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left flex items-center gap-2 text-xs text-slate-700 hover:bg-slate-50"
              >
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Diagram Health</span>
              </button>

              <button
                onClick={() => {
                  handleShare();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left flex items-center gap-2 text-xs text-slate-700 hover:bg-slate-50"
              >
                <Share2 size={14} className="text-blue-600" />
                <span>Share Diagram</span>
              </button>

              <div className="h-px bg-slate-100 my-1" />

              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Frame: {currentProject.aspectRatio || 'Free'}
              </div>
              {(['free', '16:9', '1:1', '4:3'] as AspectRatio[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setAspectRatio(r);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-3 py-1 text-left flex items-center justify-between text-xs hover:bg-slate-50 ${
                    (currentProject.aspectRatio || 'free') === r ? 'font-semibold text-blue-600' : 'text-slate-600'
                  }`}
                >
                  <span className="capitalize">{r === 'free' ? 'Free (Infinite)' : r}</span>
                  {(currentProject.aspectRatio || 'free') === r && <Check size={12} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Properties Panel Toggle */}
        <button
          onClick={onToggleProperties}
          className={`p-1.5 rounded-lg border transition-colors ${
            isPropertiesOpen
              ? 'border-blue-500 bg-blue-50 text-blue-600'
              : 'border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
          title="Toggle Properties Panel"
        >
          <Sliders size={15} />
        </button>

        {/* Share Link Button (Desktop) */}
        <button
          onClick={handleShare}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-blue-400 rounded-lg text-xs font-semibold text-slate-700 hover:bg-blue-50/30 transition-all"
          title="Copy shareable project link to clipboard"
        >
          {isShared ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} className="text-blue-600" />}
          <span>{isShared ? 'Link Copied!' : 'Share'}</span>
        </button>

        {/* Export Button */}
        <button
          onClick={() => setIsExportOpen(true)}
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
          title="Export high-resolution visual"
        >
          <Download size={14} />
          <span className="hidden xs:inline">Export</span>
        </button>

        {/* Settings button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
          title="AI Provider Settings"
        >
          <Settings size={15} />
        </button>
      </div>
    </header>
  );
};

