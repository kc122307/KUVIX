import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  FileImage,
  FileCode,
  FileText,
  Sparkles,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useDiagramStore } from '../../store/useDiagramStore';
import { exportDiagram, copyDiagramToClipboard } from '../../services/exportService';

interface ExportModalProps {
  canvasElement: HTMLElement | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({ canvasElement }) => {
  const { currentProject, isExportOpen, setIsExportOpen } = useDiagramStore();

  const [format, setFormat] = useState<'png' | 'svg' | 'pdf' | 'json' | 'markdown'>('png');
  const [scale, setScale] = useState<number>(2);
  const [transparentBg, setTransparentBg] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  if (!isExportOpen) return null;

  const handleDownload = async () => {
    if (!canvasElement) return;
    setIsExporting(true);
    try {
      await exportDiagram(
        canvasElement,
        {
          format,
          scale,
          transparentBg,
          filename: currentProject.title.toLowerCase().replace(/\s+/g, '-')
        },
        currentProject
      );

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
      setIsExportOpen(false);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try a different resolution or format.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyClipboard = async () => {
    if (!canvasElement) return;
    setIsExporting(true);
    try {
      const success = await copyDiagramToClipboard(canvasElement);
      if (success) {
        setIsCopied(true);
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.8 }
        });
        setTimeout(() => setIsCopied(false), 2000);
      } else {
        alert('Could not copy image to clipboard in this browser context.');
      }
    } catch (err) {
      console.error('Clipboard copy error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Download size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Export Visual Graphic</h2>
              <p className="text-xs text-slate-500">
                Generate high-resolution image, vector, or presentation document
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsExportOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Format Selection Cards */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Output Format
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'png', name: 'PNG', icon: FileImage, desc: 'High-res bitmap' },
                { id: 'svg', name: 'SVG', icon: FileCode, desc: 'Scalable vector' },
                { id: 'pdf', name: 'PDF', icon: FileText, desc: 'Doc format' },
                { id: 'json', name: 'JSON', icon: Layers, desc: 'Editable file' },
                { id: 'markdown', name: 'Markdown', icon: FileText, desc: 'MD + Mermaid' }
              ].map((fmt) => {
                const IconComp = fmt.icon;
                return (
                  <button
                    key={fmt.id}
                    onClick={() => setFormat(fmt.id as any)}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                      format === fmt.id
                        ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-semibold ring-1 ring-blue-500'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <IconComp size={20} />
                    <span className="text-xs">{fmt.name}</span>
                    <span className="text-[9px] text-slate-400">{fmt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scale Resolution (for PNG & PDF) */}
          {format === 'png' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Resolution Scale
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 1, label: '1x (Standard)' },
                  { value: 2, label: '2x (Retina High-Res)' },
                  { value: 3, label: '3x (Ultra Print)' }
                ].map((sc) => (
                  <button
                    key={sc.value}
                    onClick={() => setScale(sc.value)}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                      scale === sc.value
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    {sc.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Transparent Background Option */}
          {format === 'png' && (
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={transparentBg}
                onChange={(e) => setTransparentBg(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span>Transparent background (ideal for slides and presentations)</span>
            </label>
          )}

          {/* Quick Copy to Clipboard Button */}
          <div className="pt-2">
            <button
              onClick={handleCopyClipboard}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-300 hover:border-blue-400 rounded-xl text-xs font-semibold text-slate-700 hover:bg-blue-50/40 transition-all shadow-xs"
            >
              {isCopied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
              <span>{isCopied ? 'Copied to Clipboard!' : 'Copy Image to Clipboard'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => setIsExportOpen(false)}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-glow flex items-center gap-2 transition-all"
          >
            <Download size={15} />
            <span>{isExporting ? 'Generating File...' : `Download ${format.toUpperCase()}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

