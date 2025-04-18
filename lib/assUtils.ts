interface AssItem {
  id: number;
  startTime: string;
  endTime: string;
  text: string;
}

/**
 * Convert ASS timestamp (h:mm:ss.cc) to SRT timestamp (hh:mm:ss,mmm)
 */
function assTimeToSrtTime(time: string): string {
  // ASS format: h:mm:ss.cc (h = hours, mm = minutes, ss = seconds, cc = centiseconds)
  // SRT format: hh:mm:ss,mmm (hh = hours, mm = minutes, ss = seconds, mmm = milliseconds)
  
  const parts = time.split(':');
  if (parts.length !== 3) return time; // Invalid format

  let hours = parts[0];
  const minutes = parts[1];
  let seconds = parts[2];
  
  // Ensure hours is two digits
  if (hours.length === 1) {
    hours = '0' + hours;
  }
  
  // Convert centiseconds to milliseconds (cc -> mmm)
  if (seconds.includes('.')) {
    const secParts = seconds.split('.');
    const sec = secParts[0];
    const centisec = secParts[1];
    // Convert centiseconds to milliseconds (multiply by 10)
    const millisec = centisec.length === 2 ? parseInt(centisec) * 10 : parseInt(centisec);
    seconds = `${sec},${millisec.toString().padStart(3, '0')}`;
  }
  
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Convert SRT timestamp (hh:mm:ss,mmm) to ASS timestamp (h:mm:ss.cc)
 */
function srtTimeToAssTime(time: string): string {
  // SRT format: hh:mm:ss,mmm (hh = hours, mm = minutes, ss = seconds, mmm = milliseconds)
  // ASS format: h:mm:ss.cc (h = hours, mm = minutes, ss = seconds, cc = centiseconds)
  
  const parts = time.split(':');
  if (parts.length !== 3) return time; // Invalid format
  
  // Remove leading zero from hours if present
  let hours = parts[0];
  if (hours.startsWith('0') && hours.length > 1) {
    hours = hours.substring(1);
  }
  
  const minutes = parts[1];
  let seconds = parts[2];
  
  // Convert milliseconds to centiseconds (mmm -> cc)
  if (seconds.includes(',')) {
    const secParts = seconds.split(',');
    const sec = secParts[0];
    const millisec = secParts[1];
    // Convert milliseconds to centiseconds (divide by 10)
    const centisec = Math.round(parseInt(millisec) / 10);
    seconds = `${sec}.${centisec.toString().padStart(2, '0')}`;
  }
  
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Parse ASS file content into array of subtitle items
 */
export function parse(content: string): AssItem[] {
  const lines = content.trim().split(/\r?\n/);
  const subtitles: AssItem[] = [];
  let isEvents = false;
  let formatLine: string[] = [];
  let id = 1;
  
  // Process line by line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (line === '') continue;
    
    // Check for the [Events] section which contains dialogues
    if (line === '[Events]') {
      isEvents = true;
      continue;
    }
    
    // Skip all sections other than [Events]
    if (line.startsWith('[') && line.endsWith(']') && line !== '[Events]') {
      isEvents = false;
      continue;
    }
    
    // Process only lines in the [Events] section
    if (isEvents) {
      // Get format line
      if (line.startsWith('Format:')) {
        formatLine = line.substring(7).split(',').map(part => part.trim());
        continue;
      }
      
      // Skip non-dialogue lines or if no format is found
      if (!line.startsWith('Dialogue:') || formatLine.length === 0) continue;
      
      // Parse dialogue line
      const parts = line.substring(9).split(',');
      if (parts.length < formatLine.length) continue;
      
      const startTimeIndex = formatLine.indexOf('Start');
      const endTimeIndex = formatLine.indexOf('End');
      const textIndex = formatLine.indexOf('Text');
      
      if (startTimeIndex === -1 || endTimeIndex === -1 || textIndex === -1) continue;
      
      // Extract start and end times
      const startTime = assTimeToSrtTime(parts[startTimeIndex]);
      const endTime = assTimeToSrtTime(parts[endTimeIndex]);
      
      // Extract text (join all remaining parts if text is split by commas)
      let text = parts.slice(textIndex).join(',');
      
      // Remove ASS formatting tags {\\...}
      text = text.replace(/{\\[^}]*}/g, '');
      
      // Add to subtitles
      subtitles.push({
        id: id++,
        startTime,
        endTime,
        text
      });
    }
  }
  
  return subtitles;
}

/**
 * Generate ASS content from subtitle items
 */
export function stringify(subtitles: AssItem[]): string {
  let output = '[Script Info]\n';
  output += 'Title: Generated by SubtitleAI\n';
  output += 'ScriptType: v4.00+\n';
  output += 'WrapStyle: 0\n';
  output += 'ScaledBorderAndShadow: yes\n';
  output += 'YCbCr Matrix: None\n\n';
  
  output += '[V4+ Styles]\n';
  output += 'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n';
  output += 'Style: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,2,2,10,10,10,1\n\n';
  
  output += '[Events]\n';
  output += 'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n';
  
  // Add dialogue lines
  subtitles.forEach(subtitle => {
    const startTime = srtTimeToAssTime(subtitle.startTime);
    const endTime = srtTimeToAssTime(subtitle.endTime);
    const text = subtitle.text;
    
    output += `Dialogue: 0,${startTime},${endTime},Default,,0,0,0,,${text}\n`;
  });
  
  return output;
} 