// @flow
import { combineReducers } from "redux";
import * as actionTypes from "./actionTypes";
import * as utils from "../utils";
import objectPath from "object-path";

const repo = (state = "", action) => {
  switch (action.type) {
    case actionTypes.SUBMIT_BINDER_FORM: {
      return action.payload.repo;
    }
    default: {
      return state;
    }
  }
};

const gitref = (state = "", action) => {
  switch (action.type) {
    case actionTypes.SUBMIT_BINDER_FORM: {
      return action.payload.gitref;
    }
    default: {
      return state;
    }
  }
};

const source = (state = "", action) => {
  switch (action.type) {
    case actionTypes.SET_SOURCE: {
      return action.payload;
    }
    default: {
      return state;
    }
  }
};

const showPanel = (state = false, action) => {
  switch (action.type) {
    case actionTypes.SET_SHOW_PANEL: {
      return action.payload;
    }
    default: {
      return state;
    }
  }
};

const currentServerId = (state = "", action) => {
  switch (action.type) {
    case actionTypes.ACTIVATE_SERVER:
    case actionTypes.SET_CURRENT_SERVER_ID: {
      return action.payload.serverId;
    }
    default: {
      return state;
    }
  }
};

const platform = (state = "", action) => {
  switch (action.type) {
    case actionTypes.SET_PLATFORM: {
      return action.payload;
    }
    default: {
      return state;
    }
  }
};

const currentKernelName = (state = "", action) => {
  switch (action.type) {
    case actionTypes.SET_CURRENT_KERNEL_NAME: {
      return action.payload;
    }
    default: {
      return state;
    }
  }
};

const currentKernelLanguage = (state = "", action) => {
  switch (action.type) {
    case actionTypes.SET_CURRENT_KERNEL_LANGUAGE: {
      return action.payload;
    }
    default: {
      return state;
    }
  }
};

const serverConfig = (state = {}, action) => {
  switch (action.type) {
    case actionTypes.ACTIVATE_SERVER_FULFILLED:
      return action.payload.config;
    default:
      return state;
  }
};

const serverMessages = (state = [], action) => {
  switch (action.type) {
    case actionTypes.ADD_SERVER_MESSAGE:
      return [...state, action.payload.message];
    default:
      return state;
  }
};

const kernelSpecsLoading = (state = false, action) => {
  switch (action.type) {
    case actionTypes.FETCH_KERNEL_SPECS:
      return true;
    case actionTypes.FETCH_KERNEL_SPECS_FULFILLED:
    case actionTypes.FETCH_KERNEL_SPECS_FAILED:
      return false;
    default:
      return state;
  }
};

const kernelSpecsError = (state = null, action) => {
  switch (action.type) {
    case actionTypes.FETCH_KERNEL_SPECS:
    case actionTypes.FETCH_KERNEL_SPECS_FULFILLED:
      return null;
    case actionTypes.FETCH_KERNEL_SPECS_FAILED:
      return action.payload.error;
    default:
      return state;
  }
};

const kernelSpecsDefault = (state = "", action) => {
  switch (action.type) {
    case actionTypes.FETCH_KERNEL_SPECS_FULFILLED:
      return action.payload.response.default;
    default:
      return state;
  }
};

const kernelSpecsKernelSpecByKernelName = (state = {}, action) => {
  switch (action.type) {
    case actionTypes.FETCH_KERNEL_SPECS_FULFILLED:
      return action.payload.response.kernelspecs;
    default:
      return state;
  }
};

const serverKernelSpecs = combineReducers({
  loading: kernelSpecsLoading,
  error: kernelSpecsError,
  default: kernelSpecsDefault,
  kernelSpecByKernelName: kernelSpecsKernelSpecByKernelName
});

const activeKernelName = (state = "", action) => {
  switch (action.type) {
    case actionTypes.ACTIVATE_KERNEL_FULFILLED:
      return action.payload.kernel.name;
    default:
      return state;
  }
};

const activeKernelId = (state = "", action) => {
  switch (action.type) {
    case actionTypes.ACTIVATE_KERNEL_FULFILLED:
      return action.payload.kernel.id;
    default:
      return state;
  }
};

const activeKernelLastActivity = (state = "", action) => {
  switch (action.type) {
    case actionTypes.ACTIVATE_KERNEL_FULFILLED:
      return action.payload.kernel.last_activity;
    default:
      return state;
  }
};

const activeKernelChannel = (state = null, action) => {
  switch (action.type) {
    case actionTypes.ACTIVATE_KERNEL_FULFILLED:
      return action.payload.kernel.channel;
    default:
      return state;
  }
};

const activeKernelOutputs = (state = [], action) => {
  switch (action.type) {
    case actionTypes.CLEAR_KERNEL_OUTPUTS:
      return [];
    case actionTypes.ADD_KERNEL_OUTPUT:
      return [...state, action.payload.output];
    default:
      return state;
  }
};

const activeKernelStatus = (state = "", action) => {
  switch (action.type) {
    case actionTypes.SET_KERNEL_STATUS:
      return action.payload.status;
    default:
      return state;
  }
};

const activeKernelMessages = (state = [], action) => {
  switch (action.type) {
    case actionTypes.ADD_KERNEL_MESSAGE:
      return [...state, action.payload.message];
    default:
      return state;
  }
};

const activeKernel = combineReducers({
  name: activeKernelName,
  id: activeKernelId,
  lastActivity: activeKernelLastActivity,
  channel: activeKernelChannel,
  outputs: activeKernelOutputs,
  status: activeKernelStatus,
  messages: activeKernelMessages
});

const activeKernelEnvelopeLoading = (state = false, action) => {
  switch (action.type) {
    case actionTypes.ACTIVATE_KERNEL: {
      return true;
    }
    case actionTypes.ACTIVATE_KERNEL_FULFILLED:
    case actionTypes.ACTIVATE_KERNEL_FAILED:
      return false;
    default:
      return state;
  }
};

const activeKernelEnvelopeError = (state = null, action) => {
  switch (action.type) {
    case actionTypes.ACTIVATE_KERNEL_FULFILLED:
    case actionTypes.ACTIVATE_KERNEL: {
      return false;
    }
    case actionTypes.ACTIVATE_KERNEL_FAILED:
      return action.payload.error;
    default:
      return state;
  }
};

const activeKernelEnvelope = combineReducers({
  loading: activeKernelEnvelopeLoading,
  error: activeKernelEnvelopeError,
  kernel: activeKernel
});

const serverActiveKernelsByName = utils.createObjectReducer({
  getKey: action => objectPath.get(action, "payload.kernelName"),
  valueReducer: activeKernelEnvelope
});

const server = combineReducers({
  config: serverConfig,
  messages: serverMessages,
  kernelSpecs: serverKernelSpecs,
  activeKernelsByName: serverActiveKernelsByName
});

const serverEnvelopeLoading = (state = false, action) => {
  switch (action.type) {
    case actionTypes.ACTIVATE_SERVER: {
      return true;
    }
    case actionTypes.ACTIVATE_SERVER_FULFILLED:
    case actionTypes.ACTIVATE_SERVER_FAILED:
      return false;
    default:
      return state;
  }
};

const serverEnvelopeError = (state = null, action) => {
  switch (action.type) {
    case actionTypes.ACTIVATE_SERVER_FULFILLED:
    case actionTypes.ACTIVATE_SERVER: {
      return false;
    }
    case actionTypes.ACTIVATE_SERVER_FAILED:
      return action.payload.error;
    default:
      return state;
  }
};

const serverEnvelope = combineReducers({
  loading: serverEnvelopeLoading,
  error: serverEnvelopeError,
  server
});

const serversById = utils.createObjectReducer({
  getKey: action => objectPath.get(action, "payload.serverId"),
  valueReducer: serverEnvelope
});

const ui = combineReducers({
  repo,
  gitref,
  source,
  showPanel,
  currentServerId,
  platform,
  currentKernelName,
  currentKernelLanguage
});

const entities = combineReducers({
  serversById
});

const reducer = combineReducers({ ui, entities });

export default reducer;
