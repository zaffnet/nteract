// @flow
import * as React from "react";

import { connect } from "react-redux";

import { Logo } from "./logos";

import * as selectors from "../../selectors";

type TitleBarProps = {
  title: string
};

export const TitleBar = (props: TitleBarProps) => (
  <React.Fragment>
    <header>
      <Logo height={20} />
      <p>{props.title}</p>
    </header>
    <style jsx>{`
      header {
        display: flex;
        justify-content: flex-start;
        background-color: var(--theme-menu-bg, rgb(250, 250, 250));
        padding: 10px 16px;
      }

      header > * {
        margin: 0 30px;
      }

      header pre {
        display: inline-block;
      }
    `}</style>
  </React.Fragment>
);

const mapStateToProps = state => ({
  title: selectors
    .currentFilename(state)
    .split("/")
    .pop()
    .split(".ipynb")
    .shift()
});

const mapDispatchToProps = dispatch => ({
  titleChanged: () => {
    // TODO: Once the content refs PR is finished use the ref to change
    // the filename, noting that the URL path should also change
    console.error("not implemented yet");
  }
});

TitleBar.defaultProps = {
  title: ""
};

export default connect(mapStateToProps, mapDispatchToProps)(TitleBar);
