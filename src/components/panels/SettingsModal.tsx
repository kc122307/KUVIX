import React, { useState } from 'react';
import { X, Cpu, Key, Server, Check, Shield } from 'lucide-react';
import { useDiagramStore } from '../../store/useDiagramStore';
import { getStoredAIConfig, saveAIConfig } from '../../engine/aiProvider';
import { AIProviderConfig } from '../../types/diagram';

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, setIsSettingsOpen } = useDiagramStore();
  const [config, setConfig] = useState<AIProviderConfig>(getStoredAIConfig());
  const [isSaved, setIsSaved] = useState(false);

  if (!isSettingsOpen) return null;

  const handleSave = () => {
    saveAIConfig(config);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setIsSettingsOpen(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Cpu size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">AI Engine Configuration</h2>
              <p className="text-xs text-slate-500">
                Choose between the built-in offline NLP engine or connect an LLM
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Provider Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Processing Provider
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfig({ ...config, provider: 'local' })}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  config.provider === 'local'
                    ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-500'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Shield size={16} className="text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800">Local NLP (Default)</span>
                </div>
                <span className="text-[11px] text-slate-500">
                  100% Free, zero latency, works completely offline without API keys.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setConfig({ ...config, provider: 'gemini', model: 'gemini-1.5-flash' })}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  config.provider === 'gemini'
                    ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-500'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Key size={16} className="text-blue-600" />
                  <span className="text-xs font-bold text-slate-800">Google Gemini</span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Direct Gemini 1.5/2.0 API connection for deep generative parsing.
                </span>
              </button>
            </div>
          </div>

          {/* Conditional API Key Input */}
          {config.provider === 'gemini' && (
            <div className="space-y-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl animate-in fade-in">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={config.apiKey || ''}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-500 bg-white"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Keys are stored exclusively in your browser localStorage.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Model
                </label>
                <select
                  value={config.model || 'gemini-1.5-flash'}
                  onChange={(e) => setConfig({ ...config, model: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none bg-white"
                >
                  <option value="gemini-1.5-flash">gemini-1.5-flash (Fast & Balanced)</option>
                  <option value="gemini-2.0-flash">gemini-2.0-flash (Latest Model)</option>
                </select>
              </div>
            </div>
          )}

          {/* Local provider guarantee */}
          {config.provider === 'local' && (
            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
              <Check size={16} className="text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <strong>Zero Setup Required:</strong> The built-in rule-based NLP engine intelligently classifies sentences, numbered steps, hierarchies, milestones, and decisions into diagram nodes and connectors instantly.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
          >
            {isSaved ? <Check size={14} /> : null}
            <span>{isSaved ? 'Saved!' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

