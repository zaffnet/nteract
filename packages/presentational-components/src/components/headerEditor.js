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
    const { editable, headerData, onChange = () => {} } = this.props;
    return (
      // NOTE: with styled-jsx we have to use React.Fragment, not <> for the time being
      <React.Fragment>
        <div style={{ background: "#EEE", padding: "10px" }}>
          <H1>
            <EditableText
              value={headerData.title}
              placeholder="Edit title..."
              disabled={!editable}
              onChange={newText => {
                onChange({
                  ...headerData,
                  title: newText
                });
              }}
            />
          </H1>
          {headerData.authors.length <= 0 ? null : (
            <p>
              By{" "}
              {headerData.authors.map(t => (
                <Tag
                  key={t}
                  large={true}
                  minimal={true}
                  style={{
                    marginRight: "5px",
                    fontStyle: "italic",
                    background: "#E5E5E5"
                  }}
                  onRemove={
                    editable
                      ? () => {
                          onChange({
                            ...headerData,
                            authors: headerData.authors.filter(p => p !== t)
                          });
                        }
                      : null
                  }
                >
                  {t}
                </Tag>
              ))}
            </p>
          )}
          {headerData.tags.map(t => (
            <Tag
              key={t}
              style={{
                marginRight: "5px",
                color: "#0366d6",
                background: "#f1f8ff"
              }}
              onRemove={
                editable
                  ? () => {
                      onChange({
                        ...headerData,
                        tags: headerData.tags.filter(p => p !== t)
                      });
                    }
                  : null
              }
            >
              {t}
            </Tag>
          ))}
          <div style={{ marginTop: "10px" }}>
            <EditableText
              maxLength={280}
              maxLines={12}
              minLines={3}
              multiline={true}
              placeholder="Edit description..."
              selectAllOnFocus={false}
              value={headerData.description}
              disabled={!editable}
              onChange={newText => {
                onChange({
                  ...headerData,
                  description: newText
                });
              }}
            />
          </div>
        </div>
        <style jsx>{blueprintCSS}</style>
      </React.Fragment>
    );
  }
}
