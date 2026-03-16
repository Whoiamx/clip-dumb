import type { TrimRegion, SubtitleEntry } from "@/lib/types/project";

export interface Segment {
  sourceStart: number;
  sourceEnd: number;
  outputStart: number;
  outputEnd: number;
}

/**
 * Normalize trim regions: sort by startFrame, merge overlapping/adjacent ones.
 */
export function normalizeTrimRegions(trims: TrimRegion[]): TrimRegion[] {
  if (trims.length === 0) return [];
  const sorted = [...trims].sort((a, b) => a.startFrame - b.startFrame);
  const merged: TrimRegion[] = [{ ...sorted[0] }];

  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    const curr = sorted[i];
    if (curr.startFrame <= last.endFrame + 1) {
      last.endFrame = Math.max(last.endFrame, curr.endFrame);
    } else {
      merged.push({ ...curr });
    }
  }
  return merged;
}

/**
 * Build "kept" segments from total frames and normalized trim regions.
 * Each segment maps source frame ranges to continuous output frame ranges.
 */
export function buildSegments(totalFrames: number, trims: TrimRegion[]): Segment[] {
  const normalized = normalizeTrimRegions(trims);
  if (normalized.length === 0) {
    return [{ sourceStart: 0, sourceEnd: totalFrames - 1, outputStart: 0, outputEnd: totalFrames - 1 }];
  }

  const segments: Segment[] = [];
  let outputCursor = 0;
  let sourcePos = 0;

  for (const trim of normalized) {
    const trimStart = Math.max(0, trim.startFrame);
    const trimEnd = Math.min(totalFrames - 1, trim.endFrame);

    if (sourcePos < trimStart) {
      const segLength = trimStart - sourcePos;
      segments.push({
        sourceStart: sourcePos,
        sourceEnd: trimStart - 1,
        outputStart: outputCursor,
        outputEnd: outputCursor + segLength - 1,
      });
      outputCursor += segLength;
    }
    sourcePos = trimEnd + 1;
  }

  // Remaining after last trim
  if (sourcePos < totalFrames) {
    const segLength = totalFrames - sourcePos;
    segments.push({
      sourceStart: sourcePos,
      sourceEnd: totalFrames - 1,
      outputStart: outputCursor,
      outputEnd: outputCursor + segLength - 1,
    });
  }

  // Guard: if everything was trimmed, keep at least the first frame
  if (segments.length === 0) {
    segments.push({ sourceStart: 0, sourceEnd: 0, outputStart: 0, outputEnd: 0 });
  }

  return segments;
}

/**
 * Compute trimmed duration in frames.
 */
export function computeTrimmedDuration(totalFrames: number, trims: TrimRegion[]): number {
  if (!trims || trims.length === 0) return totalFrames;
  const segments = buildSegments(totalFrames, trims);
  if (segments.length === 0) return 1; // Guard: at least 1 frame
  const last = segments[segments.length - 1];
  return Math.max(1, last.outputEnd + 1);
}

/**
 * Convert an output frame to the corresponding source frame.
 */
export function outputToSourceFrame(outputFrame: number, segments: Segment[]): number {
  for (const seg of segments) {
    if (outputFrame >= seg.outputStart && outputFrame <= seg.outputEnd) {
      return seg.sourceStart + (outputFrame - seg.outputStart);
    }
  }
  // Past the end — return last source frame
  if (segments.length > 0) {
    return segments[segments.length - 1].sourceEnd;
  }
  return 0;
}

/**
 * Convert a source frame to the corresponding output frame.
 * Returns null if the source frame falls inside a trimmed region.
 */
export function sourceToOutputFrame(sourceFrame: number, segments: Segment[]): number | null {
  for (const seg of segments) {
    if (sourceFrame >= seg.sourceStart && sourceFrame <= seg.sourceEnd) {
      return seg.outputStart + (sourceFrame - seg.sourceStart);
    }
  }
  return null;
}

/**
 * Snap a source frame to the nearest kept frame (for seeking into trimmed regions).
 */
export function snapToKeptFrame(sourceFrame: number, segments: Segment[]): number {
  // Check if already in a kept segment
  for (const seg of segments) {
    if (sourceFrame >= seg.sourceStart && sourceFrame <= seg.sourceEnd) {
      return sourceFrame;
    }
  }

  // Find nearest segment boundary
  let bestFrame = 0;
  let bestDist = Infinity;
  for (const seg of segments) {
    const distToStart = Math.abs(sourceFrame - seg.sourceStart);
    const distToEnd = Math.abs(sourceFrame - seg.sourceEnd);
    if (distToStart < bestDist) {
      bestDist = distToStart;
      bestFrame = seg.sourceStart;
    }
    if (distToEnd < bestDist) {
      bestDist = distToEnd;
      bestFrame = seg.sourceEnd;
    }
  }
  return bestFrame;
}

/**
 * Remap subtitles from source timing to output timing.
 * Subtitles fully inside a trim are excluded.
 * Subtitles partially overlapping a trim are clamped to kept regions.
 */
export function remapSubtitles(subtitles: SubtitleEntry[], segments: Segment[]): SubtitleEntry[] {
  if (segments.length === 0) return [];

  const result: SubtitleEntry[] = [];

  for (const sub of subtitles) {
    // Find which segments this subtitle overlaps with
    let outputStart: number | null = null;
    let outputEnd: number | null = null;

    for (const seg of segments) {
      // Check if subtitle overlaps with this segment
      if (sub.endFrame < seg.sourceStart || sub.startFrame > seg.sourceEnd) {
        continue; // No overlap
      }

      // Clamp to segment bounds
      const clampedStart = Math.max(sub.startFrame, seg.sourceStart);
      const clampedEnd = Math.min(sub.endFrame, seg.sourceEnd);

      const mappedStart = seg.outputStart + (clampedStart - seg.sourceStart);
      const mappedEnd = seg.outputStart + (clampedEnd - seg.sourceStart);

      if (outputStart === null || mappedStart < outputStart) {
        outputStart = mappedStart;
      }
      if (outputEnd === null || mappedEnd > outputEnd) {
        outputEnd = mappedEnd;
      }
    }

    if (outputStart !== null && outputEnd !== null && outputEnd > outputStart) {
      result.push({
        ...sub,
        startFrame: outputStart,
        endFrame: outputEnd,
      });
    }
  }

  return result;
}
