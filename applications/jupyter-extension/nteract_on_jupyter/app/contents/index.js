// @flow

// NOTE: We can safely install and use react-hot-loader as a regular dependency
// instead of a dev dependency as it automatically ensures it is not executed
// in production and the footprint is minimal.
import { hot } from "react-hot-loader";

import * as React from "react";
import * as Immutable from "immutable";

import { selectors, actions } from "@nteract/core";
import { TitleBar, NewNotebookNavigation } from "@nteract/connected-components";

import { openNotebook } from "../triggers/open-notebook";

import type {
  KernelspecRecord,
  KernelspecProps,
  AppState,
  JupyterHostRecord
} from "@nteract/core";

import css from "styled-jsx/css";

const urljoin = require("url-join");

import { dirname } from "path";

import { default as Directory } from "./directory";
import { default as File } from "./file";
import { default as Notebook } from "./notebook";

import { WideLogo } from "@nteract/logos";

import { Nav, NavSection } from "../components/nav";

type ContentRef = ContentRef;

import { connect } from "react-redux";

type ContentsProps = {
  contentType: "dummy" | "notebook" | "directory" | "file",
  contentRef: ContentRef,
  filepath: string,
  appPath: string,
  appVersion: string,
  baseDir: string,
  host: JupyterHostRecord
};

const mapStateToProps = (state: AppState, ownProps: *): ContentsProps => {
  const contentRef = selectors.currentContentRef(state);
  const host = state.app.host;
  if (host.type !== "jupyter") {
    throw new Error("this component only works with jupyter apps");
  }

  if (!contentRef) {
    throw new Error("cant display without a contentRef");
  }

  const content = selectors.content(state, { contentRef });
  if (!content) {
    throw new Error("need content to view content, check your contentRefs");
  }

  const appVersion = selectors.appVersion(state);

  // Our base directory is the literal directory we're in otherwise it's relative
  // to the file being viewed.
  const baseDir =
    content.type === "directory" ? content.filepath : dirname(content.filepath);

  return {
    contentType: content.type,
    contentRef,
    filepath: content.filepath,
    appPath: host.basePath,
    host,
    appVersion,
    baseDir
  };
};

type FileNavProps = {
  displayName: string,
  logoHref: string,
  theme: "light" | "dark",
  onNameChange: ?(string) => any
};

class FileNav extends React.Component<FileNavProps, *> {
  render() {
    return (
      <React.Fragment>
        <Nav>
          <NavSection>
            <a href={this.props.logoHref} title="Home">
              <WideLogo height={20} theme={this.props.theme} />
            </a>
            <span>{this.props.displayName}</span>
          </NavSection>
        </Nav>
        <style jsx>{`
          :global(.nteract-nav) {
            background-color: DeepPink;
          }
          a {
            /* margin: 0px var(--nt-spacing-xl) 0px 0px; */
          }
        `}</style>
      </React.Fragment>
    );
  }
}

const mapStateToFileNavProps = (
  state: AppState,
  ownProps: {
    filename: string,
    appPath: string,
    baseDir: string
  }
) => ({
  displayName: ownProps.filename
    .split("/")
    .pop()
    .split(".ipynb")
    .shift(),
  theme: selectors.currentTheme(state),
  logoHref: urljoin(ownProps.appPath, "/nteract/edit/", ownProps.baseDir)
});

const mapDispatchToFileNavProps = dispatch => ({
  onNameChange: (filename: string) => {
    // TODO: Once the content refs PR is finished use the ref to change
    // the filename, noting that the URL path should also change
    console.error("not implemented yet");
  }
});

const ConnectedFileNav = connect(
  mapStateToFileNavProps,
  mapDispatchToFileNavProps
)(FileNav);

class TitleMenu extends React.Component<*, *> {
  render() {
    return null;
  }
}

const Container = ({ children }) => (
  <div>
    {children}
    <style jsx>{`
      div {
        padding-left: var(--nt-spacing-l, 10px);
        padding-top: var(--nt-spacing-m, 10px);
        padding-right: var(--nt-spacing-m, 10px);
      }
    `}</style>
  </div>
);

class Contents extends React.Component<ContentsProps, null> {
  constructor(props) {
    super(props);
    (this: any).openNotebook = this.openNotebook.bind(this);
  }

  openNotebook(ks: KernelspecRecord | KernelspecProps) {
    openNotebook(this.props.host, ks, {
      appVersion: this.props.appVersion,
      baseDir: this.props.baseDir,
      appPath: this.props.appPath
    });
  }

  render() {
    switch (this.props.contentType) {
      case "notebook":
        return (
          <React.Fragment>
            <ConnectedFileNav
              filename={this.props.filepath}
              baseDir={this.props.baseDir}
              appPath={this.props.appPath}
            />
            <TitleMenu />
            <Notebook contentRef={this.props.contentRef} />
          </React.Fragment>
        );
      case "file":
        return (
          <React.Fragment>
            <ConnectedFileNav
              filename={this.props.filepath}
              baseDir={this.props.baseDir}
              appPath={this.props.appPath}
            />
            <File contentRef={this.props.contentRef} />
          </React.Fragment>
        );
      case "dummy":
        return (
          <React.Fragment>
            <ConnectedFileNav
              filename={this.props.filepath}
              baseDir={this.props.baseDir}
              appPath={this.props.appPath}
            />
          </React.Fragment>
        );
      case "directory":
        return (
          <React.Fragment>
            <ConnectedFileNav
              filename={this.props.filepath}
              baseDir={this.props.baseDir}
              appPath={this.props.appPath}
            />
            <NewNotebookNavigation onClick={this.openNotebook} />
            <Directory contentRef={this.props.contentRef} />
          </React.Fragment>
        );
      default:
        return (
          <div>{`content type ${this.props.contentType} not implemented`}</div>
        );
    }
  }
}

export default connect(mapStateToProps)(hot(module)(Contents));
