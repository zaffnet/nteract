// @flow
import * as React from "react";

import blueprintCSS from "../vendor/blueprint.css.js";

import {
  H1,
  Intent,
  Tag,
  EditableText,
  Button,
  Position,
  Tooltip
} from "@blueprintjs/core";

// https://github.com/jupyter/nbformat/blob/master/nbformat/v4/nbformat.v4.schema.json#L67

const tagStyle = {
  marginRight: "5px",
  color: "#0366d6",
  background: "#f1f8ff"
};

const authorStyle = {
  marginRight: "5px",
  fontStyle: "italic",
  background: "#E5E5E5"
};

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

export type HeaderEditorState = {
  editMode: "none" | "author" | "tag"
};

export class HeaderEditor extends React.Component<
  HeaderEditorProps,
  HeaderEditorState
> {
  constructor(props: HeaderEditorProps) {
    super(props);

    this.state = {
      editMode: "none"
    };
  }
  static defaultProps = {
    editable: true,
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
                  style={authorStyle}
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
              {(this.state.editMode === "author" && (
                <Tag style={{ ...authorStyle, color: "black" }}>
                  <EditableText
                    maxLength={40}
                    placeholder="Enter Author Name..."
                    selectAllOnFocus={true}
                    onConfirm={e => {
                      onChange({
                        ...headerData,
                        authors: [...headerData.authors, e]
                      });
                      this.setState({ editMode: "none" });
                    }}
                    onCancel={() => this.setState({ editMode: "none" })}
                  />
                </Tag>
              )) || (
                <Tooltip
                  content={<span>Add another author</span>}
                  position={Position.RIGHT}
                  usePortal={false}
                >
                  <Button
                    icon="add"
                    onClick={() => this.setState({ editMode: "author" })}
                    minimal={true}
                  />
                </Tooltip>
              )}
            </p>
          )}
          <p>
            {headerData.tags.map(t => (
              <Tag
                key={t}
                style={tagStyle}
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
            {(this.state.editMode === "tag" && (
              <Tag style={tagStyle}>
                <EditableText
                  maxLength={20}
                  placeholder="Enter Tag Name..."
                  selectAllOnFocus={true}
                  onConfirm={e => {
                    onChange({
                      ...headerData,
                      tags: [...headerData.tags, e]
                    });
                    this.setState({ editMode: "none" });
                  }}
                  onCancel={() => this.setState({ editMode: "none" })}
                />
              </Tag>
            )) || (
              <Tooltip
                content={<span>Add another tag</span>}
                position={Position.RIGHT}
                usePortal={false}
              >
                {
                  <Button
                    icon="add"
                    minimal={true}
                    onClick={() => this.setState({ editMode: "tag" })}
                  />
                }
              </Tooltip>
            )}
          </p>
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
