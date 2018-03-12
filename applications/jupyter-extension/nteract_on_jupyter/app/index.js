// @flow
import * as React from "react";
import ReactDOM from "react-dom";

import { Provider } from "react-redux";
import * as Immutable from "immutable";

import NotificationSystem from "react-notification-system";

import configureStore from "./store";

import {
  ModalController,
  NotebookApp,
  NotebookMenu,
  Styles,
  TitleBar,
  actions,
  state
} from "@nteract/core";

function createApp(store: *) {
  class App extends React.Component<*> {
    notificationSystem: NotificationSystem;

    render(): React$Element<any> {
      return (
        <Provider store={store}>
          <React.Fragment>
            <Styles>
              <TitleBar />
              <NotebookMenu />
              <NotebookApp />
              <NotificationSystem
                ref={notificationSystem => {
                  this.notificationSystem = notificationSystem;
                }}
              />
              <ModalController />
            </Styles>
            <style jsx global>{`
              body {
                font-family: "Source Sans Pro";
                font-size: 16px;
                line-height: 22px;
                background-color: var(--theme-app-bg);
                color: var(--theme-app-fg);
                /* All the old theme setups declared this, putting it back for consistency */
                line-height: 1.3 !important;
                margin: 0;
              }

              #app {
                padding-top: 20px;
              }

              @keyframes fadeOut {
                from {
                  opacity: 1;
                }
                to {
                  opacity: 0;
                }
              }

              div#loading {
                animation-name: fadeOut;
                animation-duration: 0.25s;
                animation-fill-mode: forwards;
              }
            `}</style>
          </React.Fragment>
        </Provider>
      );
    }
  }

  return App;
}

export type JupyterConfigData = {
  token: string,
  page: "tree" | "view" | "edit",
  contentsPath: string,
  baseUrl: string,
  appVersion: string
};

function main(rootEl: Element, dataEl: Node | null) {
  // When the data element isn't there, provide an error message
  // Primarily for development usage
  const ErrorPage = (props: { error?: Error }) => (
    <React.Fragment>
      <h1>ERROR</h1>
      <pre>Unable to parse / process the jupyter config data.</pre>
      {props.error ? props.error.message : null}
    </React.Fragment>
  );

  if (!dataEl) {
    ReactDOM.render(<ErrorPage />, rootEl);
    return;
  }

  let config: JupyterConfigData;

  try {
    config = JSON.parse(dataEl.textContent);
  } catch (err) {
    ReactDOM.render(<ErrorPage error={err} />, rootEl);
    return;
  }

  const jupyterHostRecord = state.makeJupyterHostRecord({
    id: null,
    type: "jupyter",
    defaultKernelName: "python",
    token: config.token,
    serverUrl: location.origin + config.baseUrl
  });

  const hostRef = state.createHostRef();
  const contentRef = state.createContentRef();

  const initialState = {
    app: state.makeAppRecord({
      version: `nteract-on-jupyter@${config.appVersion}`,
      // TODO: Move into core as a "current" host
      host: jupyterHostRecord
    }),
    comms: state.makeCommsRecord(),
    config: Immutable.Map({
      theme: "light"
    }),
    core: state.makeStateRecord({
      // TODO: non-prioritized -- set the currentHostRef here
      currentContentRef: contentRef,
      entities: state.makeEntitiesRecord({
        hosts: state.makeHostsRecord({
          byRef: Immutable.Map().set(hostRef, jupyterHostRecord)
        }),
        contents: state.makeContentsRecord({
          byRef: Immutable.Map().set(
            contentRef,
            state.makeContentRecord({
              path: config.contentsPath
            })
          )
        })
      })
    })
  };

  const kernelRef = state.createKernelRef();
  const kernelspecsRef = state.createKernelspecsRef();

  const store = configureStore(initialState);
  window.store = store;

  store.dispatch(
    actions.fetchContent({
      path: config.contentsPath,
      params: {},
      kernelRef,
      contentRef
    })
  );
  store.dispatch(actions.fetchKernelspecs({ hostRef, kernelspecsRef }));

  const App = createApp(store);
  ReactDOM.render(<App />, rootEl);
}

const rootEl = document.querySelector("#root");
const dataEl = document.querySelector("#jupyter-config-data");

if (!rootEl || !dataEl) {
  alert("Something drastic happened, and we don't have config data");
} else {
  main(rootEl, dataEl);
}
