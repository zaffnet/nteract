// @flow
import * as React from "react";

import blueprintCSS from "../vendor/blueprint.css.js";

import { H1, Intent, Tag, EditableText } from "@blueprintjs/core";

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
    theme: "light",
    headerData: {
      authors: [],
      title: "",
      description: "",
      tags: []
    }
  };

  render() {
    // Otherwise assume they have their own editor component
    return (
      // NOTE: with styled-jsx we have to use React.Fragment, not <> for the time being
      <React.Fragment>
        <div style={{ background: "#EEE", padding: "10px" }}>
          <H1>
            <EditableText
              value={this.props.headerData.title}
              placeholder="Edit title..."
            />
          </H1>
          {this.props.headerData.authors.length <= 0 ? null : (
            <p>
              By{" "}
              <span style={{ fontStyle: "italic" }}>
                {this.props.headerData.authors.join(", ")}
              </span>{" "}
            </p>
          )}
          <p>
            {this.props.headerData.tags.map(t => (
              <Tag
                key={t}
                onRemove={() => {
                  console.log("removing tag ", t);
                }}
              >
                {t}
              </Tag>
            ))}
          </p>
          <p style={{ fontSize: "14px" }}>
            {this.props.headerData.description}
          </p>
        </div>
        <style jsx>{blueprintCSS}</style>
      </React.Fragment>
    );
  }
}
