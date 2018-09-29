/* @flow strict */
import * as React from "react";

export type MathJaxObject = {
  Hub: {
    getJaxFor: HTMLElement => void,
    Config: (options: *) => void,
    Register: {
      StartupHook: (str: string, cb: () => void) => void,
      MessageHook: (string, cb: (msg: string) => void) => void
    },
    Reprocess: (HTMLElement, cb: *) => *,
    Queue: (*) => void,
    processSectionDelay: number
  }
};

export type MathJaxContextValue = {
  MathJax: ?MathJaxObject,
  input: "tex" | "ascii"
};

const MathJaxContext: React.Context<MathJaxContextValue> = React.createContext({
  MathJax: null,
  input: "tex"
});

export default MathJaxContext;
