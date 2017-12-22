// @flow
import * as actionTypes from "./actionTypes";
import * as actions from "./actions";

// $FlowFixMe: ofType should now be a lettable operator and is used on master
import { combineEpics, ofType } from "redux-observable";

import { of } from "rxjs/observable/of";
import { merge } from "rxjs/observable/merge";

import {
  catchError,
  ignoreElements,
  map,
  mergeMap,
  switchMap,
  tap
} from "rxjs/operators";
import { binder } from "rx-binder";
import { kernels, shutdown, kernelspecs } from "rx-jupyter";
import { v4 as uuid } from "uuid";
import { executeRequest, kernelInfoRequest } from "@nteract/messaging";
import objectPath from "object-path";

const activateServerEpic = action$ =>
  action$.pipe(
    ofType(actionTypes.ACTIVATE_SERVER),
    switchMap(({ payload: { serverId, oldServerId, repo, gitref } }) => {
      return binder({ repo, gitref }, window.EventSource).pipe(
        mergeMap(message => {
          const actionsArray = [
            actions.addServerMessage({ serverId, message })
          ];
          if (message.phase === "ready") {
            const config = {
              endpoint: message.url.replace(/\/\s*$/, ""),
              uri: "/",
              token: message.token,
              crossDomain: true
            };
            actionsArray.push(
              actions.activateServerFulfilled({ serverId, config })
            );
            actionsArray.push(actions.fetchKernelSpecs({ serverId }));
            if (oldServerId) {
              // TODO: kill server epic doesn't exist yet to handle this.
              actionsArray.push(actions.killServer({ serverId: oldServerId }));
            }
          }
          return of(...actionsArray);
        }),
        catchError(error =>
          of(actions.activateServerFailed({ serverId, error }))
        )
      );
    })
  );

const fetchKernelSpecsEpic = (action$, store) =>
  action$.pipe(
    ofType(actionTypes.FETCH_KERNEL_SPECS),
    mergeMap(({ payload: { serverId } }) => {
      const { config } = store.getState().entities.serversById[serverId].server;
      // $FlowFixMe: this should be ok, once rebased this should work out
      return kernelspecs.list(config).pipe(
        mergeMap(data => {
          const kernelName = data.response.default;
          return of(
            actions.fetchKernelSpecsFulfilled({
              serverId,
              response: data.response
            }),
            actions.setActiveKernel({ serverId, kernelName })
          );
        }),
        catchError(error =>
          of(actions.fetchKernelSpecsFailed({ serverId, error }))
        )
      );
    })
  );

const setActiveKernelEpic = (action$, store) =>
  action$.pipe(
    ofType(actionTypes.SET_ACTIVE_KERNEL),
    mergeMap(({ payload: { serverId, kernelName } }) => {
      const channelPath = [
        "entities",
        "serversById",
        serverId,
        "server",
        "activeKernelsByName",
        kernelName,
        "kernel",
        "channel"
      ];
      const channel = objectPath.get(store.getState(), channelPath);
      const actionsArray = [actions.setCurrentKernelName(kernelName)];
      if (!channel) {
        actionsArray.push(actions.activateKernel({ serverId, kernelName }));
      }
      return of(...actionsArray);
    })
  );

const activateKernelEpic = (action$, store) =>
  action$.pipe(
    ofType(actionTypes.ACTIVATE_KERNEL),
    mergeMap(({ payload: { serverId, kernelName } }) => {
      const configPath = [
        "entities",
        "serversById",
        serverId,
        "server",
        "config"
      ];
      const config = objectPath.get(store.getState(), configPath);
      return kernels.start(config, kernelName, "").pipe(
        mergeMap(data => {
          const kernel = data.response;
          const session = uuid();
          kernel.channel = kernels.connect(config, kernel.id, session);
          const channelAction$ = kernel.channel.pipe(
            mergeMap(message => {
              const actionsArray = [
                actions.addKernelMessage({ serverId, kernelName, message })
              ];
              switch (message.header.msg_type) {
                case "status":
                  actionsArray.push(
                    actions.setKernelStatus({
                      serverId,
                      kernelName,
                      status: message.content.execution_state
                    })
                  );
                  break;
                case "display_data":
                case "execute_result":
                case "stream":
                case "error":
                  actionsArray.push(
                    actions.addKernelOutput({
                      serverId,
                      kernelName,
                      output: {
                        ...message.content,
                        output_type: message.header.msg_type
                      }
                    })
                  );
                  break;
                default:
                  break;
              }
              return of(...actionsArray);
            })
          );

          // The responses to these have to happen on the next tick, so we expect
          // that we'll be subscribed by then.
          kernel.channel.next(kernelInfoRequest());
          kernel.channel.next(kernelInfoRequest());

          return merge(
            of(
              actions.activateKernelFulfilled({
                serverId,
                kernelName,
                kernel
              })
            ),
            channelAction$
          );
        })
      );
    })
  );

const runSourceEpic = (action$, store) =>
  action$.pipe(
    ofType(actionTypes.RUN_SOURCE),
    map(({ payload: { serverId, kernelName, source } }) => {
      const channelPath = [
        "entities",
        "serversById",
        serverId,
        "server",
        "activeKernelsByName",
        kernelName,
        "kernel",
        "channel"
      ];
      const channel = objectPath.get(store.getState(), channelPath);
      if (channel) {
        channel.next(executeRequest(source));
      }
      return actions.setSource(source);
    })
  );

const epics = combineEpics(
  activateServerEpic,
  fetchKernelSpecsEpic,
  setActiveKernelEpic,
  activateKernelEpic,
  runSourceEpic
);

export default epics;
