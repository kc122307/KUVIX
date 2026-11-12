import JSZip from 'jszip';
import {
  SourceDocument,
  SourceSection,
  SourceType,
  DocumentVersionDiff
} from '../types/source';
import { AppNode } from '../types/diagram';

/**
 * Multi-Source Parser Engine
 * Handles PDF, DOCX, PPTX, Markdown, Text, Code Repositories, URLs, and Pasted text.
 */

// Helper to generate IDs
const genId = (prefix = 'sec') => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

/**
 * Extract text from DOCX file using JSZip and DOMParser
 */
export async function parseDocxFile(file: File | ArrayBuffer): Promise<{ content: string; sections: SourceSection[] }> {
  const zip = new JSZip();
  const data = await zip.loadAsync(file);

  const documentXml = await data.file('word/document.xml')?.async('text');
  if (!documentXml) {
    throw new Error('Invalid DOCX file: word/document.xml not found.');
  }

  const sections: SourceSection[] = [];
  let fullText = '';
  let currentHeading = 'Introduction';
  let currentPage = 1;
  let currentParagraphs: string[] = [];
  let lineCounter = 1;

  if (typeof DOMParser !== 'undefined') {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(documentXml, 'application/xml');
    const paragraphs = xmlDoc.getElementsByTagName('w:p');

    for (let i = 0; i < paragraphs.length; i++) {
      const p = paragraphs[i];

      // Check for page breaks
      const brs = p.getElementsByTagName('w:br');
      for (let b = 0; b < brs.length; b++) {
        if (brs[b].getAttribute('w:type') === 'page') {
          currentPage++;
        }
      }

      // Check for headings
      const styleEl = p.getElementsByTagName('w:pStyle')[0];
      const styleVal = styleEl?.getAttribute('w:val') || '';
      const isHeading = styleVal.toLowerCase().includes('heading') || styleVal.toLowerCase().includes('title');

      // Extract text runs
      const textNodes = p.getElementsByTagName('w:t');
      let text = '';
      for (let t = 0; t < textNodes.length; t++) {
        text += textNodes[t].textContent || '';
      }

      const trimmed = text.trim();
      if (!trimmed) continue;

      if (isHeading) {
        if (currentParagraphs.length > 0) {
          sections.push({
            id: genId('docx-sec'),
            sourceId: '',
            heading: currentHeading,
            content: currentParagraphs.join('\n'),
            pageNumber: currentPage,
            lineNumber: lineCounter
          });
          currentParagraphs = [];
        }
        currentHeading = trimmed;
      } else {
        currentParagraphs.push(trimmed);
      }

      fullText += (isHeading ? `\n\n## ${trimmed}\n` : `${trimmed}\n`);
      lineCounter++;
    }
  } else {
    // Node.js regex-based fallback
    const pRegex = /<w:p\b[^>]*>([\s\S]*?)<\/w:p>/gi;
    let pMatch: RegExpExecArray | null;
    while ((pMatch = pRegex.exec(documentXml)) !== null) {
      const pXml = pMatch[1];
      if (pXml.includes('w:type="page"')) currentPage++;
      const isHeading = pXml.includes('Heading') || pXml.includes('Title');
      const tRegex = /<w:t\b[^>]*>(.*?)<\/w:t>/gi;
      let tMatch: RegExpExecArray | null;
      let text = '';
      while ((tMatch = tRegex.exec(pXml)) !== null) {
        text += tMatch[1];
      }
      const trimmed = text.trim();
      if (!trimmed) continue;

      if (isHeading) {
        if (currentParagraphs.length > 0) {
          sections.push({
            id: genId('docx-sec'),
            sourceId: '',
            heading: currentHeading,
            content: currentParagraphs.join('\n'),
            pageNumber: currentPage,
            lineNumber: lineCounter
          });
          currentParagraphs = [];
        }
        currentHeading = trimmed;
      } else {
        currentParagraphs.push(trimmed);
      }

      fullText += (isHeading ? `\n\n## ${trimmed}\n` : `${trimmed}\n`);
      lineCounter++;
    }
  }

  if (currentParagraphs.length > 0 || sections.length === 0) {
    sections.push({
      id: genId('docx-sec'),
      sourceId: '',
      heading: currentHeading,
      content: currentParagraphs.join('\n') || fullText.slice(0, 500),
      pageNumber: currentPage,
      lineNumber: lineCounter
    });
  }

  return { content: fullText.trim(), sections };
}

/**
 * Extract text from PPTX file using JSZip and DOMParser
 */
export async function parsePptxFile(file: File | ArrayBuffer): Promise<{ content: string; sections: SourceSection[] }> {
  const zip = new JSZip();
  const data = await zip.loadAsync(file);

  const slideFiles = Object.keys(data.files).filter(name =>
    name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
  ).sort((a, b) => {
    const numA = parseInt(a.replace(/[^0-9]/g, '')) || 0;
    const numB = parseInt(b.replace(/[^0-9]/g, '')) || 0;
    return numA - numB;
  });

  const sections: SourceSection[] = [];
  let fullText = '';

  for (let idx = 0; idx < slideFiles.length; idx++) {
    const slideXml = await data.file(slideFiles[idx])?.async('text');
    if (!slideXml) continue;

    const slideLines: string[] = [];
    if (typeof DOMParser !== 'undefined') {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(slideXml, 'application/xml');
      const textNodes = xmlDoc.getElementsByTagName('a:t');
      for (let t = 0; t < textNodes.length; t++) {
        const line = textNodes[t].textContent?.trim();
        if (line) slideLines.push(line);
      }
    } else {
      const tRegex = /<a:t\b[^>]*>(.*?)<\/a:t>/gi;
      let tMatch: RegExpExecArray | null;
      while ((tMatch = tRegex.exec(slideXml)) !== null) {
        const line = tMatch[1].trim();
        if (line) slideLines.push(line);
      }
    }

    const slideNumber = idx + 1;
    const slideTitle = slideLines[0] || `Slide ${slideNumber}`;
    const slideContent = slideLines.slice(1).join('\n') || slideTitle;

    sections.push({
      id: genId('pptx-slide'),
      sourceId: '',
      slideNumber,
      heading: slideTitle,
      content: slideLines.join('\n'),
      pageNumber: slideNumber,
      lineNumber: idx * 10 + 1
    });

    fullText += `# Slide ${slideNumber}: ${slideTitle}\n${slideContent}\n\n`;
  }

  return { content: fullText.trim(), sections };
}

/**
 * Extract text from PDF file
 * Handles standard PDF text operators (BT...ET, Tj, TJ) and stream objects
 */
export async function parsePdfFile(file: File | ArrayBuffer): Promise<{ content: string; sections: SourceSection[] }> {
  const arrayBuffer = file instanceof File ? await file.arrayBuffer() : file;
  const bytes = new Uint8Array(arrayBuffer);
  const decoder = new TextDecoder('latin1');
  const rawString = decoder.decode(bytes);

  const sections: SourceSection[] = [];
  let fullText = '';

  // Find page objects
  const pageRegex = /\/Type\s*\/Page\b/g;
  let pageCount = 0;
  while (pageRegex.exec(rawString) !== null) {
    pageCount++;
  }
  if (pageCount === 0) pageCount = 1;

  // Extract text within BT ... ET blocks
  const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
  let match: RegExpExecArray | null;
  const textChunks: string[] = [];

  while ((match = streamRegex.exec(rawString)) !== null) {
    const streamContent = match[1];

    // Try extracting literal strings in parens: (Hello World) Tj
    const tjRegex = /\(([^)]+)\)\s*(?:Tj|'|")/g;
    let tjMatch: RegExpExecArray | null;
    let chunk = '';

    while ((tjMatch = tjRegex.exec(streamContent)) !== null) {
      const clean = tjMatch[1].replace(/\\([()\\])/g, '$1');
      chunk += clean + ' ';
    }

    // Try extracting TJ arrays: [(Hello) 10 (World)] TJ
    const tjArrayRegex = /\[([^\]]+)\]\s*TJ/g;
    let arrMatch: RegExpExecArray | null;
    while ((arrMatch = tjArrayRegex.exec(streamContent)) !== null) {
      const inner = arrMatch[1];
      const innerTexts = inner.match(/\(([^)]+)\)/g);
      if (innerTexts) {
        chunk += innerTexts.map(t => t.slice(1, -1).replace(/\\([()\\])/g, '$1')).join('') + ' ';
      }
    }

    if (chunk.trim().length > 5) {
      textChunks.push(chunk.trim());
    }
  }

  // If streams were compressed or unreadable directly, extract readable string runs
  if (textChunks.length === 0) {
    const printableRegex = /[\x20-\x7E]{4,}/g;
    let pMatch: RegExpExecArray | null;
    const readable: string[] = [];
    while ((pMatch = printableRegex.exec(rawString)) !== null) {
      const str = pMatch[0];
      if (!str.startsWith('/') && !str.includes('xref') && !str.includes('trailer') && !str.includes('obj')) {
        readable.push(str);
      }
    }
    if (readable.length > 0) {
      textChunks.push(...readable.slice(0, 100));
    }
  }

  // Distribute chunks across detected pages
  const chunksPerPage = Math.max(1, Math.ceil(textChunks.length / pageCount));
  for (let p = 0; p < pageCount; p++) {
    const pageChunks = textChunks.slice(p * chunksPerPage, (p + 1) * chunksPerPage);
    const pageText = pageChunks.join('\n\n') || `Document Content from Page ${p + 1}`;
    const pageNumber = p + 1;
    const heading = `Page ${pageNumber}`;

    sections.push({
      id: genId('pdf-page'),
      sourceId: '',
      pageNumber,
      heading,
      content: pageText,
      lineNumber: p * 20 + 1
    });

    fullText += `## ${heading}\n${pageText}\n\n`;
  }

  return { content: fullText.trim() || 'PDF document ingested successfully.', sections };
}

/**
 * Parse Markdown and Text files into structured sections
 */
export function parseMarkdownOrText(text: string, filename = 'document.md'): { content: string; sections: SourceSection[] } {
  const lines = text.split('\n');
  const sections: SourceSection[] = [];
  let currentHeading = 'Overview';
  let currentLines: string[] = [];
  let startLine = 1;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);

    if (headingMatch) {
      if (currentLines.length > 0) {
        sections.push({
          id: genId('md-sec'),
          sourceId: '',
          heading: currentHeading,
          content: currentLines.join('\n').trim(),
          lineNumber: startLine
        });
        currentLines = [];
      }
      currentHeading = headingMatch[2];
      startLine = index + 1;
    } else if (trimmed) {
      currentLines.push(line);
    }
  });

  if (currentLines.length > 0 || sections.length === 0) {
    sections.push({
      id: genId('md-sec'),
      sourceId: '',
      heading: currentHeading,
      content: currentLines.join('\n').trim() || text.slice(0, 500),
      lineNumber: startLine
    });
  }

  return { content: text, sections };
}

/**
 * Parse Source Code or Repository files
 */
export function parseSourceCodeFile(content: string, filePath: string): { content: string; sections: SourceSection[] } {
  const lines = content.split('\n');
  const sections: SourceSection[] = [];
  const ext = filePath.split('.').pop()?.toLowerCase() || '';

  // Extract functions, classes, interfaces
  const signatureRegex = /^(?:export\s+)?(?:async\s+)?(?:function|class|interface|type|const|let|def|fn|struct|pub fn)\s+([A-Za-z0-9_]+)/;
  let currentSymbol = `File: ${filePath}`;
  let symbolLines: string[] = [];
  let startLine = 1;

  lines.forEach((line, index) => {
    const match = line.trim().match(signatureRegex);
    if (match) {
      if (symbolLines.length > 0) {
        sections.push({
          id: genId('code-sec'),
          sourceId: '',
          heading: currentSymbol,
          content: symbolLines.join('\n'),
          codeRef: `${filePath}#L${startLine}-L${index}`,
          lineNumber: startLine
        });
        symbolLines = [];
      }
      currentSymbol = `${match[1]} (${ext.toUpperCase()})`;
      startLine = index + 1;
    }
    symbolLines.push(line);
  });

  if (symbolLines.length > 0) {
    sections.push({
      id: genId('code-sec'),
      sourceId: '',
      heading: currentSymbol,
      content: symbolLines.join('\n'),
      codeRef: `${filePath}#L${startLine}-L${lines.length}`,
      lineNumber: startLine
    });
  }

  return { content, sections };
}

/**
 * Parse Website Documentation / URLs
 */
export function parseUrlContent(url: string, rawHtml?: string, textContent?: string): { content: string; sections: SourceSection[] } {
  const sections: SourceSection[] = [];
  let text = textContent || '';
  let docTitle = `URL: ${url}`;

  if (rawHtml) {
    if (typeof DOMParser !== 'undefined') {
      const parser = new DOMParser();
      const doc = parser.parseFromString(rawHtml, 'text/html');

      // Remove script, style, nav, footer
      doc.querySelectorAll('script, style, nav, footer, noscript, iframe').forEach(el => el.remove());

      const titleEl = doc.querySelector('title, h1');
      if (titleEl) docTitle = titleEl.textContent?.trim() || docTitle;

      const headings = doc.querySelectorAll('h1, h2, h3, h4');
      headings.forEach((h, idx) => {
        let pContent = '';
        let sibling = h.nextElementSibling;
        while (sibling && !['H1', 'H2', 'H3', 'H4'].includes(sibling.tagName)) {
          pContent += (sibling.textContent?.trim() || '') + '\n';
          sibling = sibling.nextElementSibling;
        }
        if (pContent.trim()) {
          sections.push({
            id: genId('url-sec'),
            sourceId: '',
            heading: h.textContent?.trim() || `Section ${idx + 1}`,
            content: pContent.trim(),
            lineNumber: idx * 10 + 1
          });
        }
      });

      text = doc.body.textContent?.replace(/\s+/g, ' ').trim() || text;
    } else {
      // Node.js environment fallback
      const clean = rawHtml
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

      const titleMatch = clean.match(/<title[^>]*>(.*?)<\/title>/i) || clean.match(/<h1[^>]*>(.*?)<\/h1>/i);
      if (titleMatch) docTitle = titleMatch[1].replace(/<[^>]+>/g, '').trim();

      const hRegex = /<h[1-4][^>]*>(.*?)<\/h[1-4]>([\s\S]*?)(?=<h[1-4]|$)/gi;
      let hMatch: RegExpExecArray | null;
      let idx = 0;
      while ((hMatch = hRegex.exec(clean)) !== null) {
        idx++;
        const hText = hMatch[1].replace(/<[^>]+>/g, '').trim();
        const pText = hMatch[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        sections.push({
          id: genId('url-sec'),
          sourceId: '',
          heading: hText || `Section ${idx}`,
          content: pText || `Content section for ${hText}`,
          lineNumber: idx * 10 + 1
        });
      }
      text = clean.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }
  }

  if (sections.length === 0) {
    sections.push({
      id: genId('url-sec'),
      sourceId: '',
      heading: docTitle,
      content: text || `Content fetched from ${url}`,
      lineNumber: 1
    });
  }

  return { content: text || `Documentation source from ${url}`, sections };
}

/**
 * Universal File Uploader Dispatcher
 */
export async function parseUploadedSource(file: File): Promise<SourceDocument> {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  let type: SourceType = 'text';
  let result: { content: string; sections: SourceSection[] };

  if (ext === 'docx') {
    type = 'docx';
    result = await parseDocxFile(file);
  } else if (ext === 'pptx') {
    type = 'pptx';
    result = await parsePptxFile(file);
  } else if (ext === 'pdf') {
    type = 'pdf';
    result = await parsePdfFile(file);
  } else if (['ts', 'tsx', 'js', 'jsx', 'py', 'go', 'java', 'rs', 'c', 'cpp', 'cs'].includes(ext)) {
    type = 'code';
    const text = await file.text();
    result = parseSourceCodeFile(text, file.name);
  } else if (ext === 'md') {
    type = 'markdown';
    const text = await file.text();
    result = parseMarkdownOrText(text, file.name);
  } else {
    type = 'text';
    const text = await file.text();
    result = parseMarkdownOrText(text, file.name);
  }

  const sourceId = `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  result.sections.forEach(s => { s.sourceId = sourceId; });

  return {
    id: sourceId,
    name: file.name,
    type,
    content: result.content,
    sections: result.sections,
    uploadedAt: Date.now(),
    version: 1,
    fileSize: file.size
  };
}

/**
 * Compare two versions of a document to find changes and identify affected diagram nodes
 */
export function compareDocumentVersions(
  oldDoc: SourceDocument,
  newDoc: SourceDocument,
  nodes: AppNode[]
): DocumentVersionDiff {
  const addedSections: SourceSection[] = [];
  const removedSections: SourceSection[] = [];
  const modifiedSections: { oldSection: SourceSection; newSection: SourceSection }[] = [];

  const oldMap = new Map(oldDoc.sections.map(s => [s.heading || s.content.slice(0, 40), s]));
  const newMap = new Map(newDoc.sections.map(s => [s.heading || s.content.slice(0, 40), s]));

  newDoc.sections.forEach(newSec => {
    const key = newSec.heading || newSec.content.slice(0, 40);
    const oldSec = oldMap.get(key);
    if (!oldSec) {
      addedSections.push(newSec);
    } else if (oldSec.content.trim() !== newSec.content.trim()) {
      modifiedSections.push({ oldSection: oldSec, newSection: newSec });
    }
  });

  oldDoc.sections.forEach(oldSec => {
    const key = oldSec.heading || oldSec.content.slice(0, 40);
    if (!newMap.has(key)) {
      removedSections.push(oldSec);
    }
  });

  // Identify nodes impacted by changes
  const impactedNodeIds: string[] = [];
  const suggestedUpdates: DocumentVersionDiff['suggestedUpdates'] = [];

  nodes.forEach(node => {
    const evidence = node.data.evidence;
    const isDirectMatch = evidence && evidence.sourceId === oldDoc.id;

    // Check if node content matches any modified or removed section
    const nodeText = `${node.data.title} ${node.data.subtitle || ''}`.toLowerCase();

    for (const mod of modifiedSections) {
      const heading = (mod.oldSection.heading || '').toLowerCase();
      if ((isDirectMatch && evidence.heading === mod.oldSection.heading) || (heading && nodeText.includes(heading))) {
        impactedNodeIds.push(node.id);
        suggestedUpdates.push({
          nodeId: node.id,
          field: 'subtitle',
          oldValue: node.data.subtitle || '',
          newValue: mod.newSection.content.slice(0, 120) + '...',
          reason: `Source section "${mod.newSection.heading}" was updated in v${newDoc.version}`
        });
        break;
      }
    }

    for (const rem of removedSections) {
      const heading = (rem.heading || '').toLowerCase();
      if ((isDirectMatch && evidence.heading === rem.heading) || (heading && nodeText.includes(heading))) {
        if (!impactedNodeIds.includes(node.id)) {
          impactedNodeIds.push(node.id);
          suggestedUpdates.push({
            nodeId: node.id,
            field: 'badge',
            oldValue: node.data.badge || '',
            newValue: 'DEPRECATED',
            reason: `Section "${rem.heading}" was removed in v${newDoc.version}`
          });
        }
      }
    }
  });

  return {
    sourceId: newDoc.id,
    documentName: newDoc.name,
    oldVersion: oldDoc.version,
    newVersion: newDoc.version,
    addedSections,
    removedSections,
    modifiedSections,
    impactedNodeIds: Array.from(new Set(impactedNodeIds)),
    suggestedUpdates
  };
}
