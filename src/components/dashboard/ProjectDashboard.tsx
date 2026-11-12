import React, { useState } from 'react';
import {
  Zap,
  Plus,
  FolderKanban,
  MoreVertical,
  Trash2,
  Copy,
  ExternalLink,
  Search,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  GitBranch,
  RotateCw,
  Milestone,
  Network,
  Clock,
  LayoutDashboard
} from 'lucide-react';
import { useDiagramStore } from '../../store/useDiagramStore';
import { DiagramType } from '../../types/diagram';

const TEMPLATE_PREVIEWS = [
  {
    title: 'Cloud Architecture Pipeline',
    type: 'process' as DiagramType,
    icon: GitBranch,
    desc: 'Step-by-step technical pipeline with gateways, microservices, and databases.',
    badge: 'ENGINEERING'
  },
  {
    title: 'Customer Onboarding Flow',
    type: 'flowchart' as DiagramType,
    icon: GitBranch,
    desc: 'Decision-based flowchart with verification criteria and role branches.',
    badge: 'PRODUCT'
  },
  {
    title: 'DevOps Flywheel Cycle',
    type: 'cycle' as DiagramType,
    icon: RotateCw,
    desc: 'Continuous feedback loop connecting design, shipping, and telemetry analytics.',
    badge: 'OPERATIONS'
  },
  {
    title: 'Strategic Roadmap 2025',
    type: 'timeline' as DiagramType,
    icon: Milestone,
    desc: 'Milestone timeline detailing quarterly deliverables and core outcomes.',
    badge: 'STRATEGY'
  }
];

export const ProjectDashboard: React.FC = () => {
  const {
    currentProject,
    projects,
    loadProjectById,
    createNewProject,
    deleteProject,
    duplicateProject,
    setActiveView
  } = useDiagramStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.documentText.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-glow">
            <Zap size={20} className="fill-current text-amber-300" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-none">KUVIX</h1>
            <span className="text-xs text-blue-600 font-medium">Words into worlds.</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentProject && (
            <button
              onClick={() => setActiveView('editor')}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-all"
              title="Return to the active canvas editor"
            >
              <LayoutDashboard size={15} className="text-blue-600" />
              <span>Back to Editor</span>
            </button>
          )}
          <button
            onClick={() => createNewProject('Untitled Visual Diagram')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-subtle hover:shadow-glow transition-all"
          >
            <Plus size={16} />
            <span>Create New Visual</span>
          </button>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="max-w-6xl w-full mx-auto p-6 md:p-8 flex-1 space-y-8">
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-elevated relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-xs rounded-full text-xs font-medium text-blue-100 mb-3">
              <Sparkles size={13} className="text-amber-300" />
              <span>Content-First Visual Generation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Words into worlds.
            </h2>
            <p className="text-blue-100 text-sm leading-relaxed mb-6">
              Paste paragraphs, meeting logs, technical architectures, or strategic roadmaps. KUVIX parses structure and generates stunning interactive diagrams.
            </p>
            <button
              onClick={() => createNewProject('New Product Workflow')}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 rounded-xl text-xs font-bold shadow-md transition-all"
            >
              <Zap size={16} className="fill-current text-amber-400" />
              <span>Generate From Text</span>
            </button>
          </div>

          {/* Decorative Background Circles */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute right-32 -top-12 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Starter Templates */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Starter Diagram Templates</h3>
              <p className="text-xs text-slate-500">Pick a pre-configured template to jumpstart your visuals</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEMPLATE_PREVIEWS.map((tmpl, idx) => {
              const IconComp = tmpl.icon;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    createNewProject(tmpl.title);
                  }}
                  className="p-5 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:shadow-elevated transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {tmpl.badge}
                      </span>
                      <IconComp size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-1.5">
                      {tmpl.title}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {tmpl.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                    <span>Use template</span>
                    <ArrowRight size={13} className="transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recent Projects Section */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Your Visual Projects</h3>
              <p className="text-xs text-slate-500">{filteredProjects.length} projects stored in browser</p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 hover:shadow-elevated transition-all flex flex-col justify-between relative group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {project.diagramType}
                    </span>

                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === project.id ? null : project.id);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === project.id && (
                        <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-elevated py-1 z-30">
                          <button
                            onClick={() => {
                              duplicateProject(project.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <Copy size={13} /> Duplicate
                          </button>
                          <button
                            onClick={() => {
                              deleteProject(project.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3 py-1.5 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title & Preview Content */}
                  <h4
                    onClick={() => loadProjectById(project.id)}
                    className="text-sm font-bold text-slate-800 hover:text-blue-600 cursor-pointer transition-colors mb-1.5 line-clamp-1"
                  >
                    {project.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {project.documentText.replace(/^[#\d\.\s\-]+/gm, '').trim()}
                  </p>
                </div>

                {/* Footer Metrics */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <span>{project.nodes.length} nodes</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {formatRelativeTime(project.updatedAt)}
                    </span>
                  </div>

                  <button
                    onClick={() => loadProjectById(project.id)}
                    className="flex items-center gap-1 text-blue-600 font-semibold hover:underline"
                  >
                    <span>Open</span>
                    <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

