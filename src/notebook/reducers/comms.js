/* @flow */
import * as Immutable from 'immutable';

type CommState = Immutable.Map<string, any>;

const defaultCommState : CommState = Immutable.Map({
  targets: Immutable.Map(),
});

type RegisterCommTargetAction = { type: 'REGISTER_COMM_TARGET', name: string, handler: string };
function registerCommTarget(state: CommState, action: RegisterCommTargetAction): CommState {
  return state.setIn(['targets', action.name], action.handler);
}

type CommAction = RegisterCommTargetAction;

export default function (state: CommState = defaultCommState, action: CommAction) {
  switch (action.type) {
    case 'REGISTER_COMM_TARGET':
      return registerCommTarget(state, action);
    default:
      return state;
  }
}
