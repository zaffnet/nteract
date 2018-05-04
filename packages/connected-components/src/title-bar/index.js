// @flow
import * as React from "react";

import { connect } from "react-redux";

import { Logo } from "./logos";

import { selectors } from "@nteract/core";
import type { AppState } from "@nteract/core";

type TitleBarProps = {
  title: string,
  theme: "light" | "dark",
  onTitleChange?: (title: string) => void,
  logoHref?: string,
  logoTitle?: string
};

export const TitleBar = (props: TitleBarProps) => (
  <React.Fragment>
    <header>
      <a href={props.logoHref} title={props.logoTitle}>
        <Logo height={20} theme={props.theme} />
      </a>
      <p>{props.title}</p>
    </header>
    <style jsx>{`
      header {
        display: flex;
        justify-content: flex-start;
        background-color: var(--theme-title-bar-bg, rgb(250, 250, 250));
        padding: var(--nt-spacing-m) var(--nt-spacing-xl);
      }

      a {
        display: inline-block;
        margin: 0px var(--nt-spacing-xl) 0px 0px;
      }

      p {
        display: inline-block;
        margin: 0px var(--nt-spacing-xl) 0px 0px;
      }
    `}</style>
  </React.Fragment>
);

const mapStateToProps = (
  state: AppState,
  ownProps: { logoHref?: string }
): TitleBarProps => ({
  title: selectors
    .currentFilepath(state)
    .split("/")
    .pop()
    .split(".ipynb")
    .shift(),
  theme: selectors.currentTheme(state),
  logoHref: ownProps.logoHref
});

const mapDispatchToProps = dispatch => ({
  onTitleChange: (title: string) => {
    // TODO: Once the content refs PR is finished use the ref to change
    // the filename, noting that the URL path should also change
    console.error("not implemented yet");
  }
});

TitleBar.defaultProps = {
  title: "",
  theme: "light"
};

export default connect(mapStateToProps, mapDispatchToProps)(TitleBar);
