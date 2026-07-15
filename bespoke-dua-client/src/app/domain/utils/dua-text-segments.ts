export interface DuaTextSegment {
  type: 'text' | 'name';
  value: string;
}

/** Matches `Ya Name (Arabic)` segments embedded in generated duas. */
const ALLAH_NAME_PATTERN = /Ya\s+[A-Za-z]+\s*\([^)]+\)/g;

export function parseDuaTextSegments(duaText: string): DuaTextSegment[] {
  const segments: DuaTextSegment[] = [];
  let lastIndex = 0;

  for (const match of duaText.matchAll(ALLAH_NAME_PATTERN)) {
    const index = match.index!;
    if (index > lastIndex) {
      segments.push({ type: 'text', value: duaText.slice(lastIndex, index) });
    }
    segments.push({ type: 'name', value: match[0] });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < duaText.length) {
    segments.push({ type: 'text', value: duaText.slice(lastIndex) });
  }

  if (segments.length === 0) {
    segments.push({ type: 'text', value: duaText });
  }

  return segments;
}

export function reassembleDuaText(segments: DuaTextSegment[]): string {
  return segments.map((s) => s.value).join('');
}
