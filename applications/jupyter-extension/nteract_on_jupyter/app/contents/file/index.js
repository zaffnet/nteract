/* @flow strict */

import { dirname } from "path";

import * as React from "react";
import { selectors } from "@nteract/core";
import type { ContentRef, AppState } from "@nteract/core";
import { LoadingIcon, SavingingIcon, ErrorIcon } from "@nteract/iron-icons";
import { connect } from "react-redux";

import { ThemedLogo } from "../../components/themed-logo";
import { Nav, NavSection } from "../../components/nav";
import LastSaved from "../../components/last-saved.js";
import { default as Notebook } from "../notebook";

import * as TextFile from "./text-file.js";

const urljoin = require("url-join");

const PaddedContainer = ({ children }) => (
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

type FileProps = {
  type: "notebook" | "file" | "dummy",
  contentRef: ContentRef,
  baseDir: string,
  appBase: string,
  displayName: string,
  mimetype: ?string,
  lastSavedStatement: string,
  saving: boolean,
  loading: boolean,
  error: ?{}
};

export class File extends React.PureComponent<FileProps, null> {
  render() {
    // Determine the file handler
    let choice = null;
    const icon = this.props.saving ? (
      <SavingingIcon />
    ) : this.props.error ? (
      <ErrorIcon />
    ) : this.props.loading ? (
      <LoadingIcon />
    ) : (
      ""
    );

    // notebooks don't report a mimetype so we'll use the content.type
    if (this.props.type === "notebook") {
      choice = <Notebook contentRef={this.props.contentRef} />;
    } else if (this.props.type === "dummy") {
      choice = null;
    } else if (
      this.props.mimetype == null ||
      !TextFile.handles(this.props.mimetype)
    ) {
      // TODO: Redirect to /files/ endpoint for them to download the file or view
      //       as is
      choice = (
        <PaddedContainer>
          <pre>Can not render this file type</pre>
        </PaddedContainer>
      );
    } else {
      choice = <TextFile.default contentRef={this.props.contentRef} />;
    }

    // Right now we only handle one kind of editor
    // If/when we support more modes, we would case them off here
    return (
      <React.Fragment>
        <Nav>
          <NavSection>
            <a
              href={urljoin(this.props.appBase, this.props.baseDir)}
              title="Home"
            >
              <ThemedLogo />
            </a>
            <span>{this.props.displayName}</span>
          </NavSection>
          <NavSection>
            <span className="icon">{icon}</span>
            <LastSaved contentRef={this.props.contentRef} />
          </NavSection>
        </Nav>
        {choice}
      </React.Fragment>
    );
  }
}

function makeMapStateToProps(
  initialState: AppState,
  initialOwnProps: { contentRef: ContentRef, appBase: string }
): * {
  const { contentRef, appBase } = initialOwnProps;
  console.log(contentRef);
  console.log(initialState);
  console.log(appBase);

  return function mapStateToProps(state: AppState): FileProps {
    const content = selectors.content(initialState, initialOwnProps);

    if (!content || content.type === "directory") {
      throw new Error(
        "The file component should only be used with files and notebooks"
      );
    }

    const comms = selectors.communication(initialState, initialOwnProps);
    if (!comms) {
      throw new Error("CommunicationByRef information not found");
    }

    return {
      type: content.type,
      mimetype: content.mimetype,
      contentRef,
      lastSavedStatement: "recently",
      appBase,
      baseDir: dirname(content.filepath),
      displayName: content.filepath.split("/").pop(),
      saving: comms.saving,
      loading: comms.loading,
      error: comms.error
    };
  };
}

export const ConnectedFile = connect(makeMapStateToProps)(File);

export default ConnectedFile;
