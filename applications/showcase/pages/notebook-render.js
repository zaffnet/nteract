// @flow
import * as React from "react";
import * as Immutable from "immutable";

import NotebookRender from "@nteract/notebook-render";
import { emptyNotebook, fromJS } from "@nteract/commutable";

//import { Styles } from "@nteract/presentational-components";

import { ajax } from "rxjs/observable/dom/ajax";

function frozenReviver(key, value) {
  return Object.freeze(value);
}

function createFrozenNotebook(text) {
  console.log(text);
  return JSON.parse(text, frozenReviver);
}

function fetchFromGist(gistId) {
  const path = `https://api.github.com/gists/${gistId}`;
  return (
    ajax
      .getJSON(path)
      .toPromise()
      .then(ghResponse => {
        for (const file in ghResponse.files) {
          if (/.ipynb$/.test(file)) {
            const fileResponse = ghResponse.files[file];
            if (fileResponse.truncated) {
              return fetch(fileResponse.raw_url)
                .then(resp => resp.text())
                .then(createFrozenNotebook);
            }
            return createFrozenNotebook(fileResponse.content);
          }
        }
      })
      // .then(nb => fromJS(nb))
      .catch(err => emptyNotebook)
  );
}

class StaticNotebookApp extends React.Component<
  { gistID: string },
  { notebook: any, theme: "light" | "dark" }
> {
  constructor(props: { gistID: string }) {
    super(props);
    this.state = {
      notebook: emptyNotebook,
      theme: "light"
    };
  }

  toggleTheme() {
    this.setState({ theme: this.state.theme === "light" ? "dark" : "light" });
  }

  static defaultProps = {
    // forked from https://gist.github.com/eamartin/d7f1f71e5ce54112fe05e2f2f17ebedf
    gistID: "6492e39c512aa1ea12aca96e242b5596"
  };

  static async getInitialProps(context: Object) {
    const query: Object = context.query;
    // Either the user "provides" it or we give the default gist
    return {
      gistID: query.gistID
    };
  }

  componentDidMount() {
    return fetchFromGist(this.props.gistID).then(notebook => {
      this.setState({ notebook });
    });
  }

  render() {
    if (this.state.notebook) {
      return (
        <React.Fragment>
          // Load katex stylesheet dynamically
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/katex@0.10.0-alpha/dist/katex.min.css"
            integrity="sha384-BTL0nVi8DnMrNdMQZG1Ww6yasK9ZGnUxL1ZWukXQ7fygA1py52yPp9W4wrR00VML"
            crossOrigin="anonymous"
          />
          <NotebookRender
            notebook={this.state.notebook}
            theme={this.state.theme}
          />
          <style jsx>{`
            /* Dark Button CSS */
            .theme-toggle {
              position: absolute;
              z-index: 1000;
              right: 20px;

              /* prettier-ignore */
              font-family:  "Source Sans Pro", Helvetica Neue, Helvetica, Arial, sans-serif;
              outline: 0;
              padding: 5px 12px;
              display: block;
              color: #9fa8b0;
              font-weight: bold;
              text-shadow: 1px 1px #1f272b;
              border: 1px solid #1c252b;
              border-radius: 3px;
              -moz-border-radius: 3px;
              -webkit-border-radius: 3px;
              background: #232b30; /* old browsers */
              box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.2); /* CSS3 */
            }
            .theme-toggle:hover {
              color: #fff;
              background: #4c5a64; /* old browsers */
            }
            .theme-toggle:active {
              color: #fff;
              padding: 6px 12px 4px;
              background: #20282d; /* old browsers */
              box-shadow: 1px 1px 1px rgba(255, 255, 255, 0.1); /* CSS3 */
            }
          `}</style>
          <style jsx global>{`
            body {
              background-color: ${this.state.theme === "light"
                ? "white"
                : "black"};
            }

            .theme-toggle {
              background-color: "black";
            }
          `}</style>
        </React.Fragment>
      );
    }
    return "loading...";
  }
}

export default StaticNotebookApp;
