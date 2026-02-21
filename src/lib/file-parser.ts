import { FileFormat, TranslationItem, ParsedFile, TimeCode } from '@/types/translation';
import { XMLParser } from 'fast-xml-parser';

// Time conversion utilities
export const parseTimeCode = (timeStr: string, format: FileFormat): TimeCode => {
  let match: RegExpMatchArray | null = null;

  switch (format) {
    case 'srt':
      // Format: 00:00:20,000
      match = timeStr.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
      break;
    case 'vtt':
      // Format: 00:00:20.000
      match = timeStr.match(/(\d{2}):(\d{2}):(\d{2})\.(\d{3})/);
      break;
    case 'ass':
      // Format: 0:00:20.00
      match = timeStr.match(/(\d{1,2}):(\d{2}):(\d{2})\.(\d{2})/);
      break;
    default:
      return { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 };
  }

  if (!match) {
    throw new Error(`Invalid time format: ${timeStr}`);
  }

  return {
    hours: parseInt(match[1], 10),
    minutes: parseInt(match[2], 10),
    seconds: parseInt(match[3], 10),
    milliseconds: format === 'ass' ? parseInt(match[4], 10) * 10 : parseInt(match[4], 10),
  };
};

export const formatTimeCode = (time: TimeCode, format: FileFormat): string => {
  const { hours, minutes, seconds, milliseconds } = time;
  const h = hours.toString().padStart(format === 'ass' ? 1 : 2, '0');
  const m = minutes.toString().padStart(2, '0');
  const s = seconds.toString().padStart(2, '0');

  switch (format) {
    case 'srt':
      return `${h}:${m}:${s},${milliseconds.toString().padStart(3, '0')}`;
    case 'vtt':
      return `${h}:${m}:${s}.${milliseconds.toString().padStart(3, '0')}`;
    case 'ass':
      return `${h}:${m}:${s}.${Math.floor(milliseconds / 10).toString().padStart(2, '0')}`;
    default:
      return `${h}:${m}:${s},${milliseconds.toString().padStart(3, '0')}`;
  }
};

// Format detection
export const detectFileFormat = (content: string): FileFormat => {
  const trimmed = content.trim();
  const lines = trimmed.split('\n');

  // Check for XML
  if (trimmed.startsWith('<') && (trimmed.endsWith('>') || trimmed.includes('<?xml'))) {
    return 'xml';
  }

  // Check for JSON
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch (e) {
      // Not valid JSON, continue checks
    }
  }

  // Check for ASS format
  if (content.includes('[Script Info]') || content.includes('[V4+ Styles]')) {
    return 'ass';
  }

  // Check for VTT format
  if (lines[0].trim() === 'WEBVTT' || content.includes('WEBVTT')) {
    return 'vtt';
  }

  // Default to SRT
  return 'srt';
};

// SRT Parser
const parseSRT = (content: string): TranslationItem[] => {
  const items: TranslationItem[] = [];
  const blocks = content.trim().split(/\n\s*\n/);

  blocks.forEach((block, blockIndex) => {
    const lines = block.trim().split('\n');
    if (lines.length < 3) return;

    const indexLine = lines[0].trim();
    const timeLine = lines[1].trim();
    const textLines = lines.slice(2);

    // Parse index
    const index = parseInt(indexLine, 10);
    if (isNaN(index)) return;

    // Parse time
    const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
    if (!timeMatch) return;

    const startTime = timeMatch[1];
    const endTime = timeMatch[2];
    const originalText = textLines.join('\n').trim();

    items.push({
      id: `srt-${blockIndex}`,
      index,
      startTime,
      endTime,
      originalText,
      status: 'pending',
    });
  });

  return items;
};

// VTT Parser
const parseVTT = (content: string): TranslationItem[] => {
  const items: TranslationItem[] = [];
  const lines = content.split('\n');
  let currentItem: Partial<TranslationItem> | null = null;
  let index = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip WEBVTT header and empty lines
    if (line === 'WEBVTT' || line === '' || line.startsWith('NOTE')) {
      continue;
    }

    // Time line
    const timeMatch = line.match(/(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})/);
    if (timeMatch) {
      if (currentItem) {
        // Save previous item
        items.push(currentItem as TranslationItem);
      }

      currentItem = {
        id: `vtt-${index}`,
        index: index++,
        startTime: timeMatch[1],
        endTime: timeMatch[2],
        originalText: '',
        status: 'pending',
      };
      continue;
    }

    // Text line
    if (currentItem && line !== '') {
      currentItem.originalText = currentItem.originalText
        ? `${currentItem.originalText}\n${line}`
        : line;
    }
  }

  // Add last item
  if (currentItem) {
    items.push(currentItem as TranslationItem);
  }

  return items;
};

// ASS Parser
const parseASS = (content: string): TranslationItem[] => {
  const items: TranslationItem[] = [];
  const lines = content.split('\n');
  let inEvents = false;
  let formatLine = '';
  let index = 1;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine === '[Events]') {
      inEvents = true;
      continue;
    }

    if (trimmedLine.startsWith('[') && trimmedLine !== '[Events]') {
      inEvents = false;
      continue;
    }

    if (!inEvents) continue;

    if (trimmedLine.startsWith('Format:')) {
      formatLine = trimmedLine;
      continue;
    }

    if (trimmedLine.startsWith('Dialogue:')) {
      const parts = trimmedLine.substring(9).split(',');
      if (parts.length < 10) continue;

      const startTime = parts[1].trim();
      const endTime = parts[2].trim();
      const text = parts.slice(9).join(',').trim();

      // Remove ASS formatting tags
      const cleanText = text.replace(/\{[^}]*\}/g, '').replace(/\\N/g, '\n');

      items.push({
        id: `ass-${index}`,
        index: index++,
        startTime,
        endTime,
        originalText: cleanText,
        status: 'pending',
      });
    }
  }

  return items;
};

// JSON Parser
const parseJSON = (content: string): TranslationItem[] => {
  const items: TranslationItem[] = [];
  let index = 1;

  try {
    const data = JSON.parse(content);

    const traverse = (obj: any, path: string[]) => {
      if (typeof obj === 'string') {
        const key = path.join('.');
        items.push({
          id: `json-${index}`,
          index: index++,
          startTime: '', // No time for JSON
          endTime: '',
          originalText: obj,
          status: 'pending',
          metadata: { key }
        });
      } else if (Array.isArray(obj)) {
        obj.forEach((item, i) => traverse(item, [...path, i.toString()]));
      } else if (typeof obj === 'object' && obj !== null) {
        Object.keys(obj).forEach(key => traverse(obj[key], [...path, key]));
      }
    };

    traverse(data, []);
  } catch (e) {
    throw new Error('Failed to parse JSON content');
  }

  return items;
};



// XML Parser
const parseXML = (content: string): TranslationItem[] => {
  const items: TranslationItem[] = [];
  let index = 1;

  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    });
    const data = parser.parse(content);

    const traverse = (obj: any, path: string[]) => {
      if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
        const key = path.join('.');
        items.push({
          id: `xml-${index}`,
          index: index++,
          startTime: '', // No time for XML generic
          endTime: '',
          originalText: String(obj),
          status: 'pending',
          metadata: { key }
        });
      } else if (Array.isArray(obj)) {
        obj.forEach((item, i) => traverse(item, [...path, i.toString()]));
      } else if (typeof obj === 'object' && obj !== null) {
        Object.keys(obj).forEach(key => traverse(obj[key], [...path, key]));
      }
    };

    traverse(data, []);
  } catch (e) {
    throw new Error('Failed to parse XML content');
  }

  return items;
};

// Main parser function
export const parseFile = (content: string): ParsedFile => {
  const format = detectFileFormat(content);
  let items: TranslationItem[] = [];

  try {
    switch (format) {
      case 'srt':
        items = parseSRT(content);
        break;
      case 'vtt':
        items = parseVTT(content);
        break;
      case 'ass':
        items = parseASS(content);
        break;
      case 'json':
        items = parseJSON(content);
        break;
      case 'xml':
        items = parseXML(content);
        break;
    }
  } catch (error) {
    throw new Error(`Failed to parse ${format.toUpperCase()} file: ${error}`);
  }

  if (items.length === 0) {
    throw new Error('No items found in the file');
  }

  return { format, items };
};

// Validation
export const validateFile = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const validExtensions = ['.srt', '.vtt', '.ass', '.json', '.xml'];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

    if (!hasValidExtension) {
      resolve(false);
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      resolve(false);
      return;
    }

    resolve(true);
  });
};