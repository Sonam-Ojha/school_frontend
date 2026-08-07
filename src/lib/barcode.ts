/**
 * Code 39 barcode encoding.
 *
 * Code 39 rather than a denser symbology because it needs no check digit, no
 * lookup table at the scanner, and encodes the alphanumeric accession numbers
 * a library actually prints. Every handheld scanner reads it out of the box.
 *
 * Written here rather than pulled in as a dependency: the whole symbology is
 * one 44-entry table, and an artifact-safe self-contained renderer is worth
 * more than a package for it.
 *
 * Each character is nine elements, alternating bar and space and starting
 * with a bar. Exactly three of the nine are wide — which is the property that
 * makes it self-checking, and the one worth asserting against.
 */

/** `n` = narrow, `w` = wide, across the nine bar/space elements. */
const PATTERNS: Record<string, string> = {
  '0': 'nnnwwnwnn',
  '1': 'wnnwnnnnw',
  '2': 'nnwwnnnnw',
  '3': 'wnwwnnnnn',
  '4': 'nnnwwnnnw',
  '5': 'wnnwwnnnn',
  '6': 'nnwwwnnnn',
  '7': 'nnnwnnwnw',
  '8': 'wnnwnnwnn',
  '9': 'nnwwnnwnn',
  A: 'wnnnnwnnw',
  B: 'nnwnnwnnw',
  C: 'wnwnnwnnn',
  D: 'nnnnwwnnw',
  E: 'wnnnwwnnn',
  F: 'nnwnwwnnn',
  G: 'nnnnnwwnw',
  H: 'wnnnnwwnn',
  I: 'nnwnnwwnn',
  J: 'nnnnwwwnn',
  K: 'wnnnnnnww',
  L: 'nnwnnnnww',
  M: 'wnwnnnnwn',
  N: 'nnnnwnnww',
  O: 'wnnnwnnwn',
  P: 'nnwnwnnwn',
  Q: 'nnnnnnwww',
  R: 'wnnnnnwwn',
  S: 'nnwnnnwwn',
  T: 'nnnnwnwwn',
  U: 'wwnnnnnnw',
  V: 'nwwnnnnnw',
  W: 'wwwnnnnnn',
  X: 'nwnnwnnnw',
  Y: 'wwnnwnnnn',
  Z: 'nwwnwnnnn',
  '-': 'nwnnnnwnw',
  '.': 'wwnnnnwnn',
  ' ': 'nwwnnnwnn',
  $: 'nwnwnwnnn',
  '/': 'nwnwnnnwn',
  '+': 'nwnnnwnwn',
  '%': 'nnnwnwnwn',
  /** Start and stop. Never appears in the encoded value itself. */
  '*': 'nwnnwnwnn',
};

/** The delimiter Code 39 wraps every symbol in. */
const DELIMITER = '*';

export const CODE39_ALPHABET = Object.keys(PATTERNS)
  .filter((character) => character !== DELIMITER)
  .join('');

/** Can this value be printed as a Code 39 barcode at all? */
export function isEncodable(value: string): boolean {
  const upper = value.toUpperCase();
  return upper.length > 0 && [...upper].every((character) => character in PATTERNS && character !== DELIMITER);
}

export interface BarcodeBar {
  /** Bars are drawn; spaces are the gaps between them. */
  isBar: boolean;
  /** Width in narrow units — 1 or 3. */
  units: number;
}

/**
 * Turn a value into the bars and spaces to draw.
 *
 * Returns a flat run of elements including the start and stop delimiters and
 * the one-unit gap between characters, so a renderer only has to walk the
 * list and accumulate an x offset.
 *
 * Throws on an unencodable value rather than silently dropping characters —
 * a barcode that scans as something other than what is printed beneath it is
 * worse than no barcode.
 */
export function encodeCode39(value: string): BarcodeBar[] {
  const upper = value.toUpperCase();

  if (!isEncodable(upper)) {
    throw new Error(`"${value}" cannot be encoded as Code 39.`);
  }

  const characters = [DELIMITER, ...upper, DELIMITER];
  const bars: BarcodeBar[] = [];

  characters.forEach((character, index) => {
    const pattern = PATTERNS[character];

    [...pattern].forEach((element, position) => {
      bars.push({
        // Nine elements alternating bar, space, bar… so even positions are bars.
        isBar: position % 2 === 0,
        units: element === 'w' ? 3 : 1,
      });
    });

    // One narrow space between characters, but not after the stop delimiter.
    if (index < characters.length - 1) bars.push({ isBar: false, units: 1 });
  });

  return bars;
}

/** Total width of an encoded value, in narrow units. */
export function encodedWidth(value: string): number {
  return encodeCode39(value).reduce((total, bar) => total + bar.units, 0);
}
