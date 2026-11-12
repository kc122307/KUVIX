# KUVIX — Words into worlds.

> A high-performance, browser-native visual diagramming engine. **KUVIX** transforms unstructured written text into professional, editable business diagrams, flowcharts, timelines, mind maps, process pipelines, and infographics instantly.

---

## 🌟 Key Features

### 1. Text-to-Visual Generation Engine
- **Content-First Workflow:** Write or paste unstructured text, numbered steps (`1. Step`), outlines, or markdown notes into the document panel.
- **Semantic Heuristic Parser:** Automatically extracts entities, concepts, hierarchies, milestones, and decision gates without needing expensive cloud APIs.
- **KUVIX Visual Spark:** Floating interactive trigger button suggests multiple diagram topologies ranked by contextual match confidence.
- **8 Supported Diagram Typologies:**
  1. **Stepped Process Pipeline** — Linear or horizontal stages with numerical badges and directional flow.
  2. **Workflow & Decision Flowchart** — Directional graph connecting action nodes and conditional decision diamonds with Yes/No branches.
  3. **Mind Map & Brainstorm Tree** — Central core idea branching outward into sub-topics and organic leaves.
  4. **Chronological Roadmap / Timeline** — Milestone progression plotted across quarters, years, or phases.
  5. **Continuous Cycle / Flywheel** — Closed-loop cyclical sequence with continuous return connectors.
  6. **Concept Infographic Grid** — Bento-style cards with icons, metrics, and structured highlights.
  7. **Comparison & Feature Matrix** — Side-by-side columns contrasting options, pros/cons, and specifications.
  8. **Hierarchical Org Chart** — Top-down organizational tree with roles, reporting relationships, and teams.

### 2. Interactive Vector Canvas
- Built with `@xyflow/react` (React Flow v12) with custom node renderers.
- **Direct Manipulation:** Drag to reposition nodes, automatic snap lines, zoom (0.2x to 2.5x), pan, and fit-view.
- **Four Directional Connection Ports:** Connect arrows from `Top`, `Bottom`, `Left`, or `Right` handles.
- **Inline Text Editing:** Double-click any node title or subtitle to edit text directly on canvas.
- **Node Morphing:** Switch between shapes: `Rounded Card`, `Rectangle`, `Pill`, `Diamond` (decision), `Hexagon`, and `Circle`.
- **Keyboard Shortcuts:**
  - `Delete` / `Backspace` — Delete selected node
  - `Ctrl + D` — Duplicate selected node
  - `Ctrl + Z` — Undo action
  - `Ctrl + Y` — Redo action
  - `Escape` — Clear selection

### 3. Visual Themes & Styles
Switch visual aesthetic across the entire canvas with a single click:
- **Minimalist Business** — Clean monochrome lines, crisp borders, and subtle blue accents.
- **Modern Gradient** — Indigo-violet tones with soft card shadows and glowing accents.
- **Corporate Royal** — Authoritative deep navy headers and enterprise blue connectors.
- **Emerald Ecosystem** — Fresh emerald greens and mint highlights for sustainability & tech.
- **Warm Sunset** — Amber, orange, and coral hues for product vision and marketing.
- **Cyber Slate (Dark Mode)** — High-contrast slate theme with neon cyan connectors.
- **Pastel Workshop** — Soft playful tones with rounded pill cards for workshops.

### 4. AI-Powered Assistance & Natural Language Refinement
- **Zero-Setup Local NLP:** Fully functional out of the box with 0 external dependencies and 100% offline reliability.
- **Natural Language Refine Prompts:**
  - *"Make this more professional"* (applies executive terminology and formalizes node descriptions)
  - *"Add more steps"* (inserts quality assurance and governance verification checkpoints)
  - *"Convert this into a decision flowchart"* (transforms linear steps into conditional decision diamonds)
  - *"Simplify explanations"* (condenses text into crisp bullet takeaways)
  - *"Add high-visibility icons"* (maps contextual icons to each node)
- **Optional LLM Integration:** Built-in settings modal to optionally connect Google Gemini (1.5/2.0 Flash) or local Ollama endpoints.

### 5. Document & Project Management
- **Dashboard View:** Visual project organizer with template starters, search, project duplication, and deletion.
- **Auto-Save:** Saves project state, text, diagram layouts, and theme preferences to browser storage (`localStorage` / `IndexedDB`).
- **Undo / Redo Stack:** Full 30-step state history with rollback capability.

### 6. Multi-Format Export
- **PNG:** High-resolution bitmap export with 1x, 2x (Retina), and 3x (Print) scaling.
- **SVG:** Scalable vector graphics export preserving crisp shapes and typography.
- **PDF:** Document export properly scaled to canvas dimensions.
- **Copy to Clipboard:** One-click copy of the diagram image directly to system clipboard for pasting into Slack, Notion, or Google Docs.
- **JSON:** Export and backup raw editable diagram project files.
- **Transparent Background:** Optional transparent background mode for slide decks.

---

## 📁 Project Architecture & Folder Structure

```
kuvix/
├── index.html                   # HTML entry point with Inter typography
├── package.json                 # Project dependencies & scripts
├── postcss.config.js            # PostCSS configuration
├── tailwind.config.js           # Custom Tailwind theme, brand colors & shadows
├── tsconfig.json                # Strict TypeScript compiler options
├── vite.config.ts               # Vite configuration with React plugin
└── src/
    ├── main.tsx                 # React DOM mount point
    ├── App.tsx                  # Root workspace coordinator
    ├── index.css                # Global stylesheet and React Flow overrides
    ├── types/
    │   └── diagram.ts           # Type definitions for nodes, edges, themes, projects
    ├── engine/
    │   ├── nlpParser.ts         # Heuristic NLP parser & visual suggestion scoring
    │   ├── diagramGenerators.ts # Visual graph generators for 8 diagram types
    │   ├── autoLayout.ts        # Dagre Sugiyama + radial + grid layout algorithms
    │   ├── themes.ts            # Visual themes, palettes, and styling definitions
    │   ├── aiRefiner.ts         # Natural language prompt diagram modifier
    │   └── aiProvider.ts        # Pluggable AI provider abstraction (Local/Gemini)
    ├── store/
    │   └── useDiagramStore.ts   # Zustand global store with 30-step undo/redo
    ├── services/
    │   ├── storage.ts           # Persistent project storage & default templates
    │   └── exportService.ts     # PNG, SVG, PDF, JSON, and Clipboard exporters
    └── components/
        ├── canvas/
        │   ├── DiagramCanvas.tsx  # React Flow canvas wrapper with grid & minimap
        │   ├── CustomNode.tsx     # Rich editable node with shape morphing & handles
        │   └── IconRenderer.tsx   # Context-aware Lucide icon selector
        ├── editor/
        │   └── DocumentEditor.tsx # Markdown/text editor with Spark generator button
        ├── toolbar/
        │   └── TopToolbar.tsx     # Project title, undo/redo, theme, export, settings
        ├── panels/
        │   ├── VisualSuggestionsModal.tsx # Napkin-style visual options carousel
        │   ├── PropertiesPanel.tsx        # Element shape, colors, and icon inspector
        │   ├── AiRefineModal.tsx          # Natural language AI instruction modal
        │   └── SettingsModal.tsx          # AI provider configuration dialog
        ├── export/
        │   └── ExportModal.tsx    # High-res export dialog with scale and clipboard
        └── dashboard/
            └── ProjectDashboard.tsx # Project management workspace and templates
```

---

## 🚀 Installation & Running

### Prerequisites
- Node.js (v18.0.0 or higher, tested on Node v22)
- npm or pnpm

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 3. Build for Production
```bash
npm run build
```

