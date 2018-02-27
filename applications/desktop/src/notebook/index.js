// @flow
import * as React from "react";
import ReactDOM from "react-dom";
import { ipcRenderer as ipc, remote } from "electron";
import { Provider } from "react-redux";

import MathJax from "@nteract/mathjax";

import { Map as ImmutableMap } from "immutable";

import NotificationSystem from "react-notification-system";

import configureStore from "./store";

import { actions, NotebookApp, Styles } from "@nteract/core";

import { displayOrder, transforms } from "@nteract/transforms-full";

import { initMenuHandlers } from "./menu";
import { initNativeHandlers } from "./native-window";
import { initGlobalHandlers } from "./global-events";

import { state } from "@nteract/core";

const store = configureStore({
  // $FlowFixMe
  app: state.makeAppRecord({
    host: state.makeDesktopHostRecord(),
    version: remote.app.getVersion()
  }),
  document: state.makeDocumentRecord(),
  comms: state.makeCommsRecord(),
  config: ImmutableMap({
    theme: "light"
  })
});

// Register for debugging
window.store = store;

initNativeHandlers(store);
initMenuHandlers(store);
initGlobalHandlers(store);

export default class App extends React.PureComponent<Object, Object> {
  notificationSystem: NotificationSystem;

  componentDidMount(): void {
    store.dispatch(actions.setNotificationSystem(this.notificationSystem));
    ipc.send("react-ready");
  }

  render(): ?React$Element<any> {
    // eslint-disable-line class-methods-use-this
    return (
      <Provider store={store}>
        <React.Fragment>
          <Styles>
            <MathJax.Context input="tex">
              <NotebookApp
                transforms={transforms}
                displayOrder={displayOrder}
              />
            </MathJax.Context>

            <NotificationSystem
              ref={notificationSystem => {
                this.notificationSystem = notificationSystem;
              }}
            />
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

const app = document.querySelector("#app");
if (app) {
  ReactDOM.render(<App />, app);
} else {
  console.error("Failed to bootstrap the notebook app");
}
