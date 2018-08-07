// @flow

import produce from "immer";

// Straight from nbformat
export type MultilineString = string | Array<string>;

export type OnDiskMimebundle = {
  "text/plain"?: MultilineString,
  "text/html"?: MultilineString,
  "text/latex"?: MultilineString,
  "text/markdown"?: MultilineString,

  "application/javascript"?: MultilineString,

  "image/png"?: MultilineString,
  "image/jpeg"?: MultilineString,
  "image/gif"?: MultilineString,
  "image/svg+xml"?: MultilineString,
  "text/vnd.plotly.v1+html"?: MultilineString,
  "application/vdom.v1+json"?: Object,
  "application/vnd.dataresource+json"?: Object,

  "text/vnd.plotly.v1+html"?: MultilineString,
  "application/vnd.plotly.v1+json"?: Object,
  "application/geo+json"?: Object,

  "application/x-nteract-model-debug+json"?: Object,

  "application/vnd.vega.v2+json"?: Object,
  "application/vnd.vega.v3+json"?: Object,
  "application/vnd.vegalite.v1+json"?: Object,
  "application/vnd.vegalite.v2+json"?: Object,

  [key: string]: string | Array<string> | Object
};

// Enumerating over all the possible
export type MimeBundle = {
  "text/plain"?: string,
  "text/html"?: string,
  "text/latex"?: string,
  "text/markdown"?: string,

  "application/javascript"?: string,

  "image/png"?: string,
  "image/jpeg"?: string,
  "image/gif"?: string,
  "image/svg+xml"?: string,

  // The JSON mimetype has some corner cases because of the protocol / format assuming the values
  // in a mimebundle are either:
  //
  //   * A string, which would be deserialized
  //   * An array, which would have to be assumed to be a multiline string
  //
  "application/json"?: Object,

  // TODO: These can all be more fully typed
  "application/vdom.v1+json"?: Object,
  "application/vnd.dataresource+json"?: Object,

  "text/vnd.plotly.v1+html"?: string,
  "application/vnd.plotly.v1+json"?: Object,
  "application/geo+json"?: Object,

  "application/x-nteract-model-debug+json"?: Object,

  "application/vnd.vega.v2+json"?: Object,
  "application/vnd.vega.v3+json"?: Object,
  "application/vnd.vegalite.v1+json"?: Object,
  "application/vnd.vegalite.v2+json"?: Object,
  [key: string]: string | Array<string> | Object // all others
};

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

function isJSONKey(key) {
  return /^application\/(.*\+)?json$/.test(key);
}

// export function cleanMimeData(
//   key: string,
//   data: string | Array<string> | Object
// ) {
//   // See https://github.com/jupyter/nbformat/blob/62d6eb8803616d198eaa2024604d1fe923f2a7b3/nbformat/v4/nbformat.v4.schema.json#L368
//   if (isJSONKey(key)) {
//     // Data stays as is for JSON types
//     return data;
//   }

//   if (typeof data === "string" || Array.isArray(data)) {
//     return demultiline(data);
//   }

//   throw new TypeError(
//     `Data for ${key} is expected to be a string or an Array of strings`
//   );
// }

// export function cleanMimeAtKey(
//   mimeBundle: OnDiskMimebundle,
//   previous: OnDiskMimebundle,
//   key: string
// ): MimeBundle {
//   return produce(previous, draft => {
//     draft[key] = cleanMimeData(key, mimeBundle[key]);
//   });
//   // return previous.set(key, cleanMimeData(key, mimeBundle[key]));
// }

export function createImmutableMimeBundle(
  mimeBundle: OnDiskMimebundle
): MimeBundle {
  // Map over all the mimetypes, turning them into our in-memory format
  //
  // {
  //   "application/json": {"a": 3, "b": 2},
  //   "text/html": ["<p>\n", "Hey\n", "</p>"],
  //   "text/plain": "Hey"
  // }
  //
  // to
  //
  // {
  //   "application/json": {"a": 3, "b": 2},
  //   "text/html": "<p>\nHey\n</p>",
  //   "text/plain": "Hey"
  // }

  return produce(
    (mimeBundle: OnDiskMimebundle),
    (draftBundle: OnDiskMimebundle): MimeBundle => {
      for (const key in draftBundle) {
        if (
          !isJSONKey(key) &&
          (typeof draftBundle[key] === "string" ||
            Array.isArray(draftBundle[key]))
        ) {
          draftBundle[key] = demultiline(draftBundle[key]);
        }
      }
    }
  );
}
