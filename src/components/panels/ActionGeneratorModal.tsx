import React, { useState } from 'react';
import {
  X,
  Zap,
  ListTodo,
  FileText,
  Milestone,
  Users2,
  Copy,
  Download,
  Check,
  Sparkles,
  CheckSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useDiagramStore } from '../../store/useDiagramStore';
import {
  ActionArtifactType,
  generateImplementationPlan,
  generateTaskChecklist,
  generateProcessSOP,
  generateProjectRoadmap,
  generateRaciMatrix
} from '../../engine/actionGenerator';

export const ActionGeneratorModal: React.FC = () => {
  const {
    currentProject,
    isActionGeneratorOpen,
    setIsActionGeneratorOpen
  } = useDiagramStore();

  const [activeTab, setActiveTab] = useState<ActionArtifactType>('task_checklist');
  const [isCopied, setIsCopied] = useState(false);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);

  if (!isActionGeneratorOpen) return null;

  const implementationPlan = generateImplementationPlan(currentProject.nodes, currentProject.edges, currentProject.title);
  const taskChecklist = generateTaskChecklist(currentProject.nodes, currentProject.edges, currentProject.title);
  const processSop = generateProcessSOP(currentProject.nodes, currentProject.edges, currentProject.title);
  const roadmap = generateProjectRoadmap(currentProject.nodes, currentProject.edges, currentProject.title);
  const raciMatrix = generateRaciMatrix(currentProject.nodes, currentProject.edges, currentProject.title);

  const artifactMap = {
    implementation_plan: implementationPlan,
    task_checklist: taskChecklist,
    process_sop: processSop,
    project_roadmap: roadmap,
    raci_matrix: raciMatrix
  };

  const currentArtifact = artifactMap[activeTab];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentArtifact.markdownContent);
      setIsCopied(true);
      confetti({ particleCount: 35, spread: 40, origin: { y: 0.8 } });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleDownloadMd = () => {
    const blob = new Blob([currentArtifact.markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${currentArtifact.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleTask = (taskId: string) => {
    setCompletedTaskIds(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl flex flex-col max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-glow">
              <Zap size={20} className="fill-current text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Diagram-to-Action Generator
              </h2>
              <p className="text-xs text-slate-500">
                Convert living visual diagrams into actionable engineering plans, SOPs, roadmaps, and tasks
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsActionGeneratorOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-5 gap-3 bg-white text-xs font-semibold overflow-x-auto">
          {[
            { id: 'task_checklist', label: 'Action Checklist', icon: ListTodo },
            { id: 'implementation_plan', label: 'Implementation Plan', icon: FileText },
            { id: 'process_sop', label: 'Process SOP', icon: FileText },
            { id: 'project_roadmap', label: 'Project Roadmap', icon: Milestone },
            { id: 'raci_matrix', label: 'RACI Governance', icon: Users2 }
          ].map(tab => {
            const IconComp = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <IconComp size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls Bar */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">
            {currentArtifact.summary}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg font-semibold text-slate-700 transition-colors shadow-xs"
            >
              {isCopied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              <span>{isCopied ? 'Copied Markdown' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownloadMd}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors shadow-xs"
            >
              <Download size={13} />
              <span>Download .MD</span>
            </button>
          </div>
        </div>

        {/* Content Preview */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'task_checklist' && taskChecklist.tasks ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                <span>Completed {completedTaskIds.length} of {taskChecklist.tasks.length} tasks</span>
                <span className="font-semibold text-slate-700">
                  {Math.round((completedTaskIds.length / taskChecklist.tasks.length) * 100)}% Complete
                </span>
              </div>

              {taskChecklist.tasks.map(t => {
                const isChecked = completedTaskIds.includes(t.id);
                return (
                  <div
                    key={t.id}
                    onClick={() => toggleTask(t.id)}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-slate-50/80 border-slate-200 opacity-60'
                        : 'bg-white border-slate-200 hover:border-orange-300 shadow-xs'
                    }`}
                  >
                    <div className="mt-0.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded text-orange-500 focus:ring-orange-400 border-slate-300 pointer-events-none"
                      />
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`font-bold ${isChecked ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {t.title}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          t.priority === 'P0' ? 'bg-red-50 text-red-700 font-mono' :
                          t.priority === 'P1' ? 'bg-amber-50 text-amber-700 font-mono' :
                          'bg-blue-50 text-blue-700 font-mono'
                        }`}>
                          {t.priority}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {t.estimatedHours}h
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {t.description}
                      </p>
                      <div className="mt-1 text-[10px] text-slate-400">
                        Assigned Role: <strong className="text-slate-600">{t.assignedRole}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
              <pre className="text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed select-text">
                {currentArtifact.markdownContent}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Synthesized directly from active canvas topology
          </span>

          <button
            onClick={() => setIsActionGeneratorOpen(false)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

