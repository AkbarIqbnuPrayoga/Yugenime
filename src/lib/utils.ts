/**
 * Shared utility functions for text formatting and UI helpers.
 */

/**
 * Truncates text at the nearest word boundary before maxLength and appends '...'
 */
export function truncateWords(text?: string | null, maxLength = 65): string {
  if (!text) return '';
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;

  const sliced = trimmed.slice(0, maxLength);
  const lastSpace = sliced.lastIndexOf(' ');

  // Cut at last space if it's reasonably far along
  if (lastSpace > maxLength * 0.4) {
    return sliced.slice(0, lastSpace).trim() + '...';
  }

  return sliced.trim() + '...';
}

/**
 * Gracefully truncates long anime titles (especially light-novel style titles with
 * long rambly subtitles or monologues) so they fit cleanly in UI headers, cards, and hero sections.
 *
 * Example:
 * 'Tsuihou Sareta Cheat Fuyo Majutsushi wa Kimama na Second Life wo Ouka Suru.: Ore wa Buki dake ja Naku...'
 * -> 'Tsuihou Sareta Cheat Fuyo Majutsushi wa Kimama na Second Life wo Ouka Suru'
 */
export function truncateTitle(title?: string | null, maxLength = 65): string {
  if (!title) return '';
  const trimmed = title.trim();
  if (trimmed.length <= maxLength) return trimmed;

  // 1. Detect light-novel subtitle separators: '.: ', ': ', ' ~ ', ' - '
  const separatorMatch = trimmed.match(/^(.*?)(?:\.:|:|\s~|\s-)\s+/);
  if (separatorMatch && separatorMatch[1]) {
    const mainTitle = separatorMatch[1].trim();
    // Only separate if the main title is of substantial length (>= 12 chars)
    if (mainTitle.length >= 12) {
      if (mainTitle.length <= maxLength) {
        return mainTitle;
      }
      return truncateWords(mainTitle, maxLength);
    }
  }

  // 2. Otherwise cut cleanly at word boundaries
  return truncateWords(trimmed, maxLength);
}
