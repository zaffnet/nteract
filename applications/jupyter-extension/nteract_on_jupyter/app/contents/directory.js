// @flow

import * as React from "react";
import * as Immutable from "immutable";
const urljoin = require("url-join");

import TimeAgo from "@nteract/timeago";
import { Book, FileText, FileDirectory } from "@nteract/octicons";

import { selectors, actions, state as stateModule } from "@nteract/core";

// Workaround flow limitation for getting these types
type ContentRef = stateModule.ContentRef;
type ContentRecord = stateModule.ContentRecord;
type DirectoryContentRecord = stateModule.DirectoryContentRecord;

import { connect } from "react-redux";

type DirectoryEntryProps = {
  basePath: string,
  entry: ContentRecord
};

/**
 * Note: the URLs we create for clicking have to take into account:
 *    Server base URL   e.g. https://j.nteract.io/user/kylek/
 *    App base URL      e.g. /nteract/edit/
 *    Filepath          e.g. Untitled.ipynb
 */

class DirectoryEntry extends React.PureComponent<DirectoryEntryProps, *> {
  render() {
    const displayName = this.props.entry.filepath.split("/").pop();
    const href = urljoin(
      this.props.basePath,
      "/nteract/edit/",
      this.props.entry.filepath
    );

    let type = this.props.entry.type;
    if (this.props.entry.type === "dummy") {
      type = this.props.entry.assumedType;
    }

    let Icon = FileText;

    switch (type) {
      case "notebook":
        Icon = Book;
        break;
      case "directory":
        Icon = FileDirectory;
        break;
      case "file":
        Icon = FileText;
        break;
    }

    return (
      <React.Fragment>
        <Icon />
        <a
          href={href}
          // When it's a notebook, we open a new tab
          target={type === "notebook" ? "_blank" : undefined}
        >
          {displayName}
        </a>
        <style jsx>{`
          a {
            padding-left: 10px;
            text-decoration: none;
            color: var(--theme-app-fg);
            background-color: var(--theme-app-bg);
          }
        `}</style>
      </React.Fragment>
    );
  }
}

const mapStateToEntryProps = (
  state: Object,
  ownProps: { contentRef: ContentRef }
): DirectoryEntryProps => {
  const host = selectors.currentHost(state);
  if (host.type !== "jupyter") {
    throw new Error("This component only works with jupyter servers");
  }

  return {
    entry: selectors.contentByRef(state, ownProps),
    basePath: host.basePath
  };
};

const ConnectedEntry = connect(mapStateToEntryProps)(DirectoryEntry);

type DirectoryProps = {
  content: DirectoryContentRecord
};

export class Directory extends React.PureComponent<DirectoryProps, *> {
  render() {
    const atRoot = this.props.content.filepath === "/";

    return (
      <ul>
        {atRoot ? null : (
          // When we're not at the root of the tree, show `..`
          <a href="..">..</a>
        )}
        {this.props.content.model.items.map(contentRef => (
          <li key={contentRef}>
            <ConnectedEntry contentRef={contentRef} />
          </li>
        ))}
        <style jsx>{`
          ul {
            list-style-type: none;
          }
        `}</style>
      </ul>
    );
  }
}

const mapStateToDirectoryProps = (
  state: Object,
  ownProps: { contentRef: ContentRef }
): DirectoryProps => {
  return { content: selectors.contentByRef(state, ownProps) };
};

export const ConnectedDirectory = connect(mapStateToDirectoryProps)(Directory);

export default ConnectedDirectory;
