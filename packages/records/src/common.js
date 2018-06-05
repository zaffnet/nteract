// @flow

// Straight from nbformat
export type MultilineString = string | Array<string>;

/**
 * Turn nbformat multiline strings (arrays of strings for simplifying diffs) into strings
 */
export function demultiline(s: string | Array<string>): string {
  if (Array.isArray(s)) {
    return s.join("");
  }
  return s;
}

/**
 * Split string into a list of strings delimited by newlines, useful for on-disk git comparisons
 */
export function remultiline(s: string | Array<string>): Array<string> {
  if (Array.isArray(s)) {
    // Assume
    return s;
  }
  // Use positive lookahead regex to split on newline and retain newline char
  return s.split(/(.+?(?:\r\n|\n))/g).filter(x => x !== "");
}
