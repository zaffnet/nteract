// @flow
import * as actionTypes from "../actionTypes";
import * as actions from "../actions";
import { catchError, map, mergeMap } from "rxjs/operators";
import { kernelspecs } from "rx-jupyter";
import { of } from "rxjs/observable/of";
import { ofType } from "redux-observable";
import type { ActionsObservable } from "redux-observable";
import type { FetchKernelspecs } from "../actionTypes";

import * as selectors from "../selectors";

export const fetchKernelspecsEpic = (
  action$: ActionsObservable<*>,
  store: any
) =>
  action$.pipe(
    ofType(actionTypes.FETCH_KERNELSPECS),
    mergeMap((action: FetchKernelspecs) => {
      const { payload: { hostRef, kernelspecsRef } } = action;
      const serverConfig = selectors.serverConfig(store.getState());
      return kernelspecs.list(serverConfig).pipe(
        map(data => {
          const defaultKernelName = data.response.default;
          const kernelspecs = {};
          Object.keys(data.response.kernelspecs).forEach(key => {
            const value = data.response.kernelspecs[key];
            kernelspecs[key] = {
              name: value.name,
              resources: value.resources,
              ...value.spec
            };
          });
          return actions.fetchKernelspecsFulfilled({
            hostRef,
            kernelspecsRef,
            defaultKernelName,
            kernelspecs
          });
        }),
        catchError(error => {
          return actions.fetchKernelspecsFailed({ kernelspecsRef, error });
        })
      );
    })
  );
