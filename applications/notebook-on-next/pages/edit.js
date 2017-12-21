// @flow
import React from "react";
import fetch from "isomorphic-fetch";
import { emptyNotebook, fromJS } from "@nteract/commutable";
import { ConnectedNotebook } from "@nteract/core/lib/components/notebook";
import withRedux from "next-redux-wrapper";
import { List as ImmutableList, Map as ImmutableMap } from "immutable";

import configureStore from "../store";

const store = configureStore();

async function fetchFromGist(gistId) {
  const path = `https://api.github.com/gists/${gistId}`;
  return fetch(path)
    .then(async response => {
      const ghResponse = await response.json();
      for (const file in ghResponse.files) {
        if (/.ipynb$/.test(file)) {
          const fileResponse = ghResponse.files[file];
          if (fileResponse.truncated) {
            return fetch(fileResponse.raw_url).then(resp => resp.json());
          }
          return JSON.parse(fileResponse.content);
        }
      }
    })
    .catch(err => emptyNotebook.toJS());
}

class Simple extends React.Component<*> {
  static async getInitialProps({ query, isServer }) {
    // TODO: Error handling
    const serverNotebook = await fetchFromGist(query.gistid);
    store.dispatch({
      type: "SET_NOTEBOOK",
      notebook: serverNotebook ? fromJS(serverNotebook) : emptyNotebook
    });
    return { serverNotebook, isServer };
  }

  componentWillMount() {
    if (this.props.serverNotebook) {
      store.dispatch({
        type: "SET_NOTEBOOK",
        notebook: this.props.serverNotebook
          ? fromJS(this.props.serverNotebook)
          : emptyNotebook
      });
    }
  }

  render() {
    return <ConnectedNotebook {...this.props} />;
  }
}

export function getLanguageMode(metadata: ImmutableMap<*, *>): string {
  // First try codemirror_mode, then name, and fallback to 'text'
  const language = metadata.getIn(
    ["language_info", "codemirror_mode", "name"],
    metadata.getIn(
      ["language_info", "codemirror_mode"],
      metadata.getIn(["language_info", "name"], "text")
    )
  );
  return language;
}

const mapStateToProps = (state: Object) => ({
  theme: state.config.get("theme"),
  lastSaved: state.app.get("lastSaved"),
  kernelSpecDisplayName: state.app.get("kernelSpecDisplayName"),
  cellOrder: state.document.getIn(["notebook", "cellOrder"], ImmutableList()),
  cellMap: state.document.getIn(["notebook", "cellMap"], ImmutableMap()),
  transient: state.document.get("transient"),
  cellPagers: state.document.get("cellPagers"),
  cellFocused: state.document.get("cellFocused"),
  editorFocused: state.document.get("editorFocused"),
  stickyCells: state.document.get("stickyCells"),
  executionState: state.app.get("executionState"),
  models: state.comms.get("models"),
  language: getLanguageMode(
    state.document.getIn(["notebook", "metadata"], ImmutableMap())
  )
});

// We should reuse the fully connected notebook from @nteract/core in the future
// since we actually don't need the serverside state
export default withRedux(() => store, mapStateToProps)(Simple);
