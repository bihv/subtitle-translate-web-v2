import { TranslationItem, FileFormat, ExportOptions } from '@/types/translation';
import { saveAs } from 'file-saver';
import { XMLBuilder } from 'fast-xml-parser';

// Export to SRT format
const exportToSRT = (items: TranslationItem[], bilingual: boolean = false): string => {
  return items.map((item, index) => {
    const indexLine = (index + 1).toString();
    const timeLine = `${item.startTime} --> ${item.endTime}`;

    let textLine = item.originalText;
    if (bilingual && item.translatedText) {
      textLine = `${item.originalText}\n${item.translatedText}`;
    } else if (item.translatedText) {
      textLine = item.translatedText;
    }

    return `${indexLine}\n${timeLine}\n${textLine}`;
  }).join('\n\n');
};

// Export to VTT format
const exportToVTT = (items: TranslationItem[], bilingual: boolean = false): string => {
  const header = 'WEBVTT\n\n';

  const content = items.map((item) => {
    // Convert SRT time format to VTT if needed
    const startTime = item.startTime.replace(',', '.');
    const endTime = item.endTime.replace(',', '.');
    const timeLine = `${startTime} --> ${endTime}`;

    let textLine = item.originalText;
    if (bilingual && item.translatedText) {
      textLine = `${item.originalText}\n${item.translatedText}`;
    } else if (item.translatedText) {
      textLine = item.translatedText;
    }

    return `${timeLine}\n${textLine}`;
  }).join('\n\n');

  return header + content;
};

// Export to ASS format
const exportToASS = (items: TranslationItem[], bilingual: boolean = false): string => {
  const header = `[Script Info]
Title: SubtitleAI Export
ScriptType: v4.00+

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,2,0,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const events = items.map((item) => {
    // Convert time format to ASS format if needed
    let startTime = item.startTime;
    let endTime = item.endTime;

    // Convert from SRT/VTT format to ASS format
    if (startTime.includes(',') || startTime.includes('.')) {
      startTime = startTime.replace(',', '.').replace(/(\d{2}):(\d{2}):(\d{2})\.(\d{3})/, '$1:$2:$3.$4');
      endTime = endTime.replace(',', '.').replace(/(\d{2}):(\d{2}):(\d{2})\.(\d{3})/, '$1:$2:$3.$4');

      // Convert to ASS centiseconds
      startTime = startTime.replace(/\.(\d{3})/, (_, ms) => `.${Math.floor(parseInt(ms) / 10).toString().padStart(2, '0')}`);
      endTime = endTime.replace(/\.(\d{3})/, (_, ms) => `.${Math.floor(parseInt(ms) / 10).toString().padStart(2, '0')}`);
    }

    let text = item.originalText;
    if (bilingual && item.translatedText) {
      text = `${item.originalText}\\N${item.translatedText}`;
    } else if (item.translatedText) {
      text = item.translatedText;
    }

    // Escape ASS special characters
    text = text.replace(/\n/g, '\\N').replace(/\{/g, '\\{').replace(/\}/g, '\\}');

    return `Dialogue: 0,${startTime},${endTime},Default,,0,0,0,,${text}`;
  }).join('\n');

  return header + events;
};

// Export to JSON format
const exportToJSON = (items: TranslationItem[], bilingual: boolean = false): string => {
  const result: any = {};

  items.forEach(item => {
    const key = item.metadata?.key;
    if (!key) return; // Should not happen for parsed JSON

    const value = bilingual && item.translatedText
      ? { original: item.originalText, translated: item.translatedText }
      : (item.translatedText || item.originalText);

    // Reconstruct nested object using key path
    const parts = key.split('.');
    let current = result;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        // Check if next part is index or key to decide array or object
        // Heuristic: if next part is numeric, it might be array. 
        // But initializing as object is safer generally unless we track array types specifically.
        // For simplicity, we use objects for intermediate nodes unless we detect numeric keys? 
        // Let's stick to objects, JSON handles numeric keys fine.
        current[part] = {};
      }
      current = current[part];
    }

    const lastPart = parts[parts.length - 1];
    current[lastPart] = value;
  });

  return JSON.stringify(result, null, 2);
};

// Export to XML format
const exportToXML = (items: TranslationItem[], bilingual: boolean = false): string => {
  const result: any = {};

  items.forEach(item => {
    const key = item.metadata?.key;
    if (!key) return;

    const value = bilingual && item.translatedText
      ? { original: item.originalText, translated: item.translatedText }
      : (item.translatedText || item.originalText);

    // Reconstruct nested object using key path
    const parts = key.split('.');
    let current = result;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }

    const lastPart = parts[parts.length - 1];
    current[lastPart] = value;
  });

  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    format: true
  });

  return builder.build(result);
};

// Main export function
export const exportFile = (
  items: TranslationItem[],
  options: ExportOptions,
  originalFileName: string
): void => {
  let content = '';
  let fileExtension = '';

  // Filter out items without translation if not bilingual and not original format
  const exportItems = options.bilingual || options.originalFormat
    ? items
    : items.filter(item => item.translatedText);

  switch (options.format) {
    case 'srt':
      content = exportToSRT(exportItems, options.bilingual);
      fileExtension = '.srt';
      break;    // ... (in exportFile switch)
    case 'xml':
      content = exportToXML(exportItems, options.bilingual);
      fileExtension = '.xml';
      break;

    case 'vtt':
      content = exportToVTT(exportItems, options.bilingual);
      fileExtension = '.vtt';
      break;
    case 'ass':
      content = exportToASS(exportItems, options.bilingual);
      fileExtension = '.ass';
      break;
    case 'json':
      content = exportToJSON(exportItems, options.bilingual);
      fileExtension = '.json';
      break;
  }

  // Generate filename
  const baseName = originalFileName.replace(/\.[^/.]+$/, '');
  const suffix = options.bilingual ? '_bilingual' : '_translated';
  const fileName = `${baseName}${suffix}${fileExtension}`;

  // Create and download file
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, fileName);
};

// Export original format
export const exportOriginalFormat = (
  items: TranslationItem[],
  originalFormat: FileFormat,
  originalFileName: string,
  bilingual: boolean = false
): void => {
  exportFile(items, {
    format: originalFormat,
    bilingual,
    originalFormat: !bilingual,
  }, originalFileName);
};

// Batch export (multiple formats)
export const batchExport = (
  items: TranslationItem[],
  formats: FileFormat[],
  originalFileName: string,
  bilingual: boolean = false
): void => {
  formats.forEach(format => {
    exportFile(items, {
      format,
      bilingual,
      originalFormat: false,
    }, originalFileName);
  });
};