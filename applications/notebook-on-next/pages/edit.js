// @flow
import React from "react";
import fetch from "isomorphic-fetch";
import { emptyNotebook, fromJS } from "@nteract/commutable";
import { Notebook } from "@nteract/core/components";
import { Provider } from "react-redux";
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

export default class Edit extends React.Component<*> {
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
        notebook: fromJS(this.props.serverNotebook)
      });
    }
  }

  render() {
    return (
      <Provider store={store}>
        <div>
          <Notebook />;
        </div>
      </Provider>
    );
  }
}
