// @flow
import * as React from "react";
import ReactDOM from "react-dom";

import { Provider } from "react-redux";

import NotificationSystem from "react-notification-system";

import configureStore from "./store";

import type { JupyterConfigData } from "./store";

import { NotebookApp, Styles } from "@nteract/core/providers";

import { addHost, fetchKernelspecs, fetchContent } from "@nteract/core/actions";

import {
  createHostRef,
  createKernelspecsRef
} from "@nteract/core/src/types/state/refs";

import {
  ModalController,
  NotebookMenu,
  TitleBar
} from "@nteract/core/components";

function createApp(jupyterConfigData: JupyterConfigData) {
  const store = configureStore({ config: jupyterConfigData });
  window.store = store;

  class App extends React.Component<*> {
    notificationSystem: NotificationSystem;

    componentDidMount(): void {
      const hostRef = createHostRef();
      const kernelspecsRef = createKernelspecsRef();
      store.dispatch(
        addHost({
          hostRef,

          // TODO: are we missing some host info here?
          host: {
            // id: string,
            type: "jupyter",
            // kernelIds: Array<Id>,
            token: jupyterConfigData.token,
            serverUrl: location.origin + jupyterConfigData.baseUrl
            // crossDomain: boolean,
            // rootContentRef: Ref,
          }
        })
      );

      // TODO: we should likely be passing in a hostRef to fetchContent too.
      store.dispatch(fetchContent({ path: jupyterConfigData.contentsPath }));
      store.dispatch(fetchKernelspecs({ hostRef, kernelspecsRef }));
    }

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

  let jupyterConfigData: JupyterConfigData;

  try {
    jupyterConfigData = JSON.parse(dataEl.textContent);
  } catch (err) {
    ReactDOM.render(<ErrorPage error={err} />, rootEl);
    return;
  }

  const App = createApp(jupyterConfigData);
  ReactDOM.render(<App />, rootEl);
}

const rootEl = document.querySelector("#root");
const dataEl = document.querySelector("#jupyter-config-data");

// $FlowFixMe: querySelector can return null so this freaks out.
main(rootEl, dataEl);
