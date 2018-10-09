// @flow
import * as React from "react";

import blueprintCSS from "../vendor/blueprint.css.js";

import { H1, Intent, Tag } from "@blueprintjs/core";

// https://github.com/jupyter/nbformat/blob/master/nbformat/v4/nbformat.v4.schema.json#L67

export type HeaderDataProps = {
  authors: Array<string>,
  title: string,
  description: string,
  tags: Array<string>
};

export type HeaderEditorProps = {
  headerData: HeaderDataProps,
  editable: boolean,
  onChange?: Function,
  theme: "light" | "dark"
};

export class HeaderEditor extends React.Component<HeaderEditorProps> {
  static defaultProps = {
    editable: false,
    theme: "light"
  };

  render() {
    // Otherwise assume they have their own editor component
    return (
      <div>
        <div style={{ background: "#EEE", padding: "10px" }}>
          <H1 style={{ fontSize: "24px", fontWeight: 900 }}>
            {this.props.headerData.title}
          </H1>
          <p>
            By{" "}
            <span style={{ fontStyle: "italic" }}>
              {this.props.headerData.authors.join(", ")}
            </span>
          </p>
          <p>
            {this.props.headerData.tags.map(t => (
              <Tag key={t}>{t}</Tag>
            ))}
          </p>
          <p style={{ fontSize: "14px" }}>
            {this.props.headerData.description}
          </p>
        </div>
        <style jsx>{blueprintCSS}</style>
      </div>
    );
  }
}
