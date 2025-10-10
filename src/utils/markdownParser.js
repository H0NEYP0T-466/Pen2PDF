import { Paragraph, TextRun, HeadingLevel } from 'docx';

/**
 * Parse markdown text and convert to DOCX paragraphs
 * Handles headings, bold, italic, code, bullets, and numbered lists
 * 
 * @param {string} content - Markdown content to parse
 * @returns {Array<Paragraph>} Array of DOCX Paragraph objects
 */
export function parseMarkdownToDocx(content) {
  const lines = content.split('\n');
  const children = [];
  
  for (const line of lines) {
    if (line.trim() === '') {
      children.push(new Paragraph({ text: '' }));
      continue;
    }
    
    // Handle headings
    if (line.startsWith('# ')) {
      children.push(new Paragraph({
        text: line.substring(2),
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 }
      }));
    } else if (line.startsWith('## ')) {
      children.push(new Paragraph({
        text: line.substring(3),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      }));
    } else if (line.startsWith('### ')) {
      children.push(new Paragraph({
        text: line.substring(4),
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 160, after: 80 }
      }));
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      children.push(new Paragraph({
        text: line.substring(2),
        bullet: { level: 0 },
        spacing: { before: 60, after: 60 }
      }));
    } else if (/^\d+\.\s/.test(line)) {
      const text = line.replace(/^\d+\.\s/, '');
      children.push(new Paragraph({
        text: text,
        numbering: { reference: 'default-numbering', level: 0 },
        spacing: { before: 60, after: 60 }
      }));
    } else {
      // Regular paragraph - handle basic markdown formatting
      const runs = [];
      // Match bold (**text**), italic (*text*), and code (`text`)
      // The [^*] and [^`] patterns ensure we don't match across different markers
      const parts = line.split(/(\*\*[^*]+?\*\*|\*[^*]+?\*|`[^`]+?`)/g);
      
      for (const part of parts) {
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          runs.push(new TextRun({ text: part.slice(2, -2), bold: true }));
        } else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
          // The regex [^*] already ensures this won't start with **
          runs.push(new TextRun({ text: part.slice(1, -1), italics: true }));
        } else if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
          runs.push(new TextRun({ 
            text: part.slice(1, -1), 
            font: 'Courier New',
            shading: { fill: 'E5E7EB' }
          }));
        } else if (part) {
          runs.push(new TextRun(part));
        }
      }
      
      children.push(new Paragraph({
        children: runs.length > 0 ? runs : [new TextRun(line)],
        spacing: { before: 100, after: 100 }
      }));
    }
  }
  
  return children;
}
