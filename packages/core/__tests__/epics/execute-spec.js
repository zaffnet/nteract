// @flow
import { ActionsObservable } from "redux-observable";
import {
  SEND_EXECUTE_REQUEST,
  ABORT_EXECUTION,
  ERROR_EXECUTING,
  EXECUTE_CELL,
  CLEAR_OUTPUTS,
  UPDATE_CELL_STATUS,
  UPDATE_DISPLAY,
  LAUNCH_KERNEL_SUCCESSFUL
} from "@nteract/core/actionTypes";

import { createExecuteRequest } from "@nteract/messaging";

import { executeCell } from "@nteract/core/actions";
import {
  executeCellStream,
  executeCellEpic,
  updateDisplayEpic,
  createExecuteCellStream
} from "../../src/epics/execute";

const Immutable = require("immutable");

import { Subject } from "rxjs/Subject";
import { from } from "rxjs/observable/from";
import { toArray, share, catchError, bufferCount } from "rxjs/operators";

describe("executeCell", () => {
  test("returns an executeCell action", () => {
    expect(executeCell("0-0-0-0")).toEqual({
      type: EXECUTE_CELL,
      id: "0-0-0-0"
    });
  });
});

describe("executeCellStream", () => {
  test("outright rejects a lack of channels.shell and iopub", done => {
    const obs = executeCellStream({}, "0", {});
    obs.subscribe(null, err => {
      expect(err.message).toEqual("kernel not connected");
      done();
    });
  });
});

describe("createExecuteCellStream", () => {
  test("errors if the kernel is not connected in create", done => {
    const frontendToShell = new Subject();
    const shellToFrontend = new Subject();
    const mockShell = Subject.create(frontendToShell, shellToFrontend);
    const mockIOPub = new Subject();
    const channels = mockShell;
    const store = {
      getState() {
        return this.state;
      },
      state: {
        app: {
          kernel: {
            channels,
            status: "not connected"
          },
          notificationSystem: { addNotification: jest.fn() }
        },
        document: Immutable.fromJS({
          notebook: {
            cellMap: {
              first: {
                source: "woo",
                cell_type: "code"
              },
              second: {
                source: "eh",
                cell_type: "code"
              }
            },
            cellOrder: ["first", "second"]
          }
        })
      }
    };
    const action$ = ActionsObservable.of({ type: SEND_EXECUTE_REQUEST });
    const observable = createExecuteCellStream(action$, store, "source", "id");
    observable.pipe(toArray()).subscribe(
      actions => {
        const payloads = actions.map(({ payload }) => payload);
        expect(payloads).toEqual(["Kernel not connected!"]);
        done();
      },
      err => done.fail(err)
    );
  });
  test("doesnt complete but does push until abort action", done => {
    const frontendToShell = new Subject();
    const shellToFrontend = new Subject();
    const mockShell = Subject.create(frontendToShell, shellToFrontend);
    const mockIOPub = new Subject();

    const channels = mockShell;
    const store = {
      getState() {
        return this.state;
      },
      state: {
        app: {
          kernel: {
            channels,
            status: "connected"
          },
          notificationSystem: { addNotification: jest.fn() },
          document: Immutable.fromJS({
            notebook: {
              cellMap: {
                first: {
                  source: "woo",
                  cell_type: "code"
                },
                second: {
                  source: "eh",
                  cell_type: "code"
                }
              },
              cellOrder: ["first", "second"]
            }
          })
        }
      }
    };
    const action$ = ActionsObservable.from([]);
    const message = createExecuteRequest("source");

    const observable = createExecuteCellStream(action$, store, message, "id");
    const actionBuffer = [];
    observable.subscribe(x => actionBuffer.push(x), err => done.fail(err));
    expect(actionBuffer).toEqual([
      {
        type: "SEND_EXECUTE_REQUEST",
        id: "id",
        message
      }
    ]);
    done();
  });
});

describe("executeCellEpic", () => {
  const store = {
    getState() {
      return this.state;
    },
    state: {
      app: {
        kernel: {
          channels: "errorInExecuteCellObservable",
          status: "idle"
        },
        notificationSystem: { addNotification: jest.fn() },
        githubToken: "blah"
      }
    }
  };
  test("Errors on a bad action", done => {
    // Make one hot action
    const badAction$ = ActionsObservable.of({
      type: EXECUTE_CELL
    }).pipe(share());
    const responseActions = executeCellEpic(badAction$, store).pipe(
      catchError(error => {
        expect(error.message).toEqual("execute cell needs an id");
      })
    );
    responseActions.subscribe(
      // Every action that goes through should get stuck on an array
      x => {
        expect(x.type).toEqual(ERROR_EXECUTING);
        done();
      },
      err => done.fail(err)
    );
  });
  test("Errors on an action where source not a string", done => {
    const badAction$ = ActionsObservable.of(executeCell("id", 2)).pipe(share());
    const responseActions = executeCellEpic(badAction$, store).pipe(
      catchError(error => {
        expect(error.message).toEqual("execute cell needs source string");
      })
    );
    responseActions.subscribe(
      // Every action that goes through should get stuck on an array
      x => {
        expect(x.type).toEqual(ERROR_EXECUTING);
        done();
      },
      err => done.fail(err)
    );
  });
  test("Informs about disconnected kernels, allows reconnection", done => {
    const store = {
      getState() {
        return this.state;
      },
      state: {
        app: {
          kernel: {
            status: "not connected"
          },
          channels: false,
          notificationSystem: { addNotification: jest.fn() }
        },
        document: Immutable.fromJS({
          notebook: {
            cellMap: {
              first: {
                source: "woo",
                cell_type: "code"
              },
              second: {
                source: "eh",
                cell_type: "code"
              }
            },
            cellOrder: ["first", "second"]
          }
        })
      }
    };

    const action$ = ActionsObservable.of(executeCell("first")).pipe(share());
    const responseActions = executeCellEpic(action$, store);
    responseActions.subscribe(
      x => {
        expect(x.payload.toString()).toEqual("Kernel not connected!");
        done();
      },
      err => done.fail(err)
    );
  });
});

describe("updateDisplayEpic", () => {
  test("handles update_display_data messages", done => {
    const messages = [
      // Should be processed
      {
        header: { msg_type: "update_display_data" },
        content: {
          data: { "text/html": "<marquee>wee</marquee>" },
          transient: { display_id: "1234" }
        }
      },
      {
        header: { msg_type: "display_data" },
        content: {
          data: { "text/html": "<marquee>wee</marquee>" },
          transient: { display_id: "5555" }
        }
      },
      // Should not be processed
      {
        header: { msg_type: "ignored" },
        content: { data: { "text/html": "<marquee>wee</marquee>" } }
      },
      {
        header: { msg_type: "update_display_data" },
        content: {
          data: { "text/plain": "i am text" },
          transient: { display_id: "here" }
        }
      }
    ];

    const channels = from(messages);
    const action$ = ActionsObservable.of({
      type: LAUNCH_KERNEL_SUCCESSFUL,
      kernel: {
        channels
      }
    });

    const epic = updateDisplayEpic(action$);

    const responseActions = [];
    epic.subscribe(
      action => responseActions.push(action),
      err => {
        throw err;
      },
      () => {
        expect(responseActions).toEqual([
          {
            type: UPDATE_DISPLAY,
            content: {
              data: { "text/html": "<marquee>wee</marquee>" },
              transient: { display_id: "1234" }
            }
          },
          {
            type: UPDATE_DISPLAY,
            content: {
              data: { "text/plain": "i am text" },
              transient: { display_id: "here" }
            }
          }
        ]);
        done();
      }
    );
  });
});
