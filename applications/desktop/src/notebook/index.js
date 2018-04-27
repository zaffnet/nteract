// @flow
import * as React from "react";
import ReactDOM from "react-dom";
import { ipcRenderer as ipc, remote } from "electron";
import { Provider } from "react-redux";

// Load the nteract fonts
require("./fonts");

import MathJax from "@nteract/mathjax";

import NotificationSystem from "react-notification-system";

import configureStore from "./store";

import { Styles } from "@nteract/presentational-components";
import { actions, state as stateModule } from "@nteract/core";

import NotebookApp from "@nteract/notebook-app-component";

import { displayOrder, transforms } from "@nteract/transforms-full";

import { initMenuHandlers } from "./menu";
import { initNativeHandlers } from "./native-window";
import { initGlobalHandlers } from "./global-events";

import * as Immutable from "immutable";

const contentRef = stateModule.createContentRef();

const initialRefs: Immutable.Map<
  stateModule.ContentRef,
  stateModule.ContentRecord
> = Immutable.Map().set(contentRef, stateModule.makeNotebookContentRecord());

const store = configureStore({
  app: stateModule.makeAppRecord({
    host: stateModule.makeLocalHostRecord(),
    version: remote.app.getVersion()
  }),
  comms: stateModule.makeCommsRecord(),
  config: Immutable.Map({
    theme: "light"
  }),
  core: stateModule.makeStateRecord({
    currentContentRef: contentRef,
    entities: stateModule.makeEntitiesRecord({
      contents: stateModule.makeContentsRecord({
        byRef: initialRefs
      })
    })
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

  render() {
    // eslint-disable-line class-methods-use-this
    return (
      <Provider store={store}>
        <React.Fragment>
          <Styles>
            <MathJax.Context input="tex">
              <NotebookApp
                // The desktop app always keeps the same contentRef in a browser window
                contentRef={contentRef}
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
