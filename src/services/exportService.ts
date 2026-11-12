import { toPng, toSvg, toBlob } from 'html-to-image';
import jsPDF from 'jspdf';
import { Project } from '../types/diagram';

export interface ExportOptions {
  format: 'png' | 'svg' | 'pdf' | 'json' | 'markdown';
  scale?: number;
  transparentBg?: boolean;
  filename?: string;
}

export async function exportDiagram(
  element: HTMLElement,
  options: ExportOptions,
  project?: Project
): Promise<void> {
  const filename = options.filename || (project?.title ? project.title.toLowerCase().replace(/\s+/g, '-') : 'diagram');
  const scale = options.scale || 2;
  const backgroundColor = options.transparentBg ? 'transparent' : undefined;

  const filter = (node: HTMLElement) => {
    // Exclude react-flow controls / minimap / resizer handles from exports
    const className = node.className || '';
    if (typeof className === 'string' && (
      className.includes('react-flow__controls') ||
      className.includes('react-flow__minimap') ||
      className.includes('react-flow__resize-control') ||
      className.includes('no-export')
    )) {
      return false;
    }
    return true;
  };

  switch (options.format) {
    case 'png': {
      const dataUrl = await toPng(element, {
        quality: 0.98,
        pixelRatio: scale,
        backgroundColor,
        filter
      });
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();
      break;
    }

    case 'svg': {
      const dataUrl = await toSvg(element, {
        backgroundColor,
        filter
      });
      const link = document.createElement('a');
      link.download = `${filename}.svg`;
      link.href = dataUrl;
      link.click();
      break;
    }

    case 'pdf': {
      const dataUrl = await toPng(element, {
        quality: 0.95,
        pixelRatio: scale,
        backgroundColor: '#ffffff',
        filter
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise(resolve => { img.onload = resolve; });

      const orientation = img.width > img.height ? 'landscape' : 'portrait';
      const pdf = new jsPDF({
        orientation,
        unit: 'px',
        format: [img.width / scale, img.height / scale]
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, img.width / scale, img.height / scale);
      pdf.save(`${filename}.pdf`);
      break;
    }

    case 'json': {
      if (project) {
        const jsonStr = JSON.stringify(project, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${filename}.kuvix.json`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }
      break;
    }

    case 'markdown': {
      if (project) {
        const mermaidEdges = project.edges.map(e => `    ${e.source.replace(/[^a-zA-Z0-9]/g, '_')} -->${e.label ? `|"${e.label}"| ` : ' '}${e.target.replace(/[^a-zA-Z0-9]/g, '_')}`).join('\n');
        const mermaidNodes = project.nodes.map(n => `    ${n.id.replace(/[^a-zA-Z0-9]/g, '_')}["${n.data.title.replace(/"/g, "'")}${n.data.subtitle ? `<br/><small>${n.data.subtitle.replace(/"/g, "'")}</small>` : ''}"]`).join('\n');
        const mdText = `# ${project.title}

${project.documentText}

---

## Visual Diagram (${project.diagramType.toUpperCase()})

\`\`\`mermaid
graph LR
${mermaidNodes}
${mermaidEdges}
\`\`\`
`;
        const blob = new Blob([mdText], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${filename}.md`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }
      break;
    }
  }
}

export async function copyDiagramToClipboard(element: HTMLElement): Promise<boolean> {
  try {
    const blob = await toBlob(element, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      filter: (node: HTMLElement) => {
        const className = node.className || '';
        if (typeof className === 'string' && (
          className.includes('react-flow__controls') ||
          className.includes('react-flow__minimap') ||
          className.includes('react-flow__resize-control') ||
          className.includes('no-export')
        )) {
          return false;
        }
        return true;
      }
    });

    if (blob) {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      return true;
    }
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
  }
  return false;
}

