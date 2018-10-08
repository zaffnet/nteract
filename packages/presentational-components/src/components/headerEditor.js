// @flow
import * as React from "react";

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
      <div style={{ background: "#EEE", padding: "10px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 900 }}>
          {this.props.headerData.title}
        </h1>
        <p>
          By{" "}
          <span style={{ fontStyle: "italic" }}>
            {this.props.headerData.authors.join(", ")}
          </span>
        </p>
        <p>
          {this.props.headerData.tags.map(t => (
            <span
              style={{
                background: "#f2f8fa",
                color: "#4078c0",
                padding: "5px",
                margin: "0 5px 0 0",
                borderRadius: "2px"
              }}
            >
              {t}
            </span>
          ))}
        </p>
        <p style={{ fontSize: "14px" }}>{this.props.headerData.description}</p>
      </div>
    );
  }
}
