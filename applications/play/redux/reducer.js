import { combineReducers } from "redux";
import * as actionTypes from "./actionTypes";
import { formBinderURL } from "rx-binder";

const repo = (state = "binder-examples/jupyter-stacks", { type, payload }) => {
  switch (type) {
    case actionTypes.SUBMIT_BINDER_FORM: {
      return payload.repo;
    }
    default: {
      return state;
    }
  }
};

const gitref = (state = "master", { type, payload }) => {
  switch (type) {
    case actionTypes.SUBMIT_BINDER_FORM: {
      return payload.gitref;
    }
    default: {
      return state;
    }
  }
};

const default_source = `from vdom import h1, p, img, div, b, span
div(
    h1('Welcome to play.nteract.io'),
    p('Run Python code via Binder & Jupyter'),
    img(src="https://bit.ly/storybot-vdom"),
    p('Change the code, click ',
        span("▶ Run", style=dict(
            color="white",
            backgroundColor="black",
            padding="10px"
        )),
      ' Up above'
    )
)`;

const source = (state = default_source, { type, payload }) => {
  switch (type) {
    case actionTypes.SET_SOURCE: {
      return payload;
    }
    default: {
      return state;
    }
  }
};

const showPanel = (state = false, { type, payload }) => {
  switch (type) {
    case actionTypes.SET_SHOW_PANEL: {
      return payload;
    }
    default: {
      return state;
    }
  }
};

const serverId = (state = "", { type, payload }) => {
  switch (type) {
    case actionTypes.SET_SERVER_ID: {
      return payload;
    }
    default: {
      return state;
    }
  }
};

const setCurrentKernelName = (state = "", { type, payload }) => {
  switch (type) {
    case actionTypes.SET_CURRENT_KERNEL_NAME: {
      return payload;
    }
    default: {
      return state;
    }
  }
};

const server = (state = {}, { type, payload }) => {
  switch (type) {
    case actionTypes.FETCH_SERVER: {
      return { ...state, isFetching: true, error: null };
    }
    case actionTypes.FETCH_SERVER_FULFILLED: {
      return { ...state, isFetching: false, error: null };
    }
    case actionTypes.FETCH_SERVER_FAILED: {
      return { ...state, isFetching: false, error: payload };
    }
    case actionTypes.SET_SERVER:
    case actionTypes.FETCH_SERVER_CANCELED:
    case actionTypes.KILL_SERVER:
    case actionTypes.KILL_SERVER_FULFILLED:
    case actionTypes.KILL_SERVER_FAILED:
    case actionTypes.KILL_SERVER_CANCELED:
    case actionTypes.FETCH_KERNEL_SPECS:
    case actionTypes.FETCH_KERNEL_SPECS_FULFILLED:
    case actionTypes.FETCH_KERNEL_SPECS_FAILED:
    case actionTypes.FETCH_KERNEL_SPECS_CANCELED:
    case actionTypes.SET_ACTIVE_KERNEL:
    case actionTypes.SET_RESTART_KERNEL:
    case actionTypes.ACTIVATE_KERNEL:
    case actionTypes.ACTIVATE_KERNEL_FULFILLED:
    case actionTypes.ACTIVATE_KERNEL_FAILED:
    case actionTypes.ACTIVATE_KERNEL_CANCELED:
    case actionTypes.INTERRUPT_KERNEL:
    case actionTypes.INTERRUPT_KERNEL_FULFILLED:
    case actionTypes.INTERRUPT_KERNEL_FAILED:
    case actionTypes.INTERRUPT_KERNEL_CANCELED:
    case actionTypes.KILL_KERNEL:
    case actionTypes.KILL_KERNEL_FULFILLED:
    case actionTypes.KILL_KERNEL_FAILED:
    case actionTypes.KILL_KERNEL_CANCELED: {
    }
    default:
      return state;
  }
};

const serversById = (state = {}, { type, payload }) => {
  switch (type) {
    case actionTypes.FETCH_SERVER:
    case actionTypes.FETCH_SERVER_FULFILLED:
    case actionTypes.SET_SERVER:
    case actionTypes.FETCH_SERVER_FAILED:
    case actionTypes.FETCH_SERVER_CANCELED:
    case actionTypes.KILL_SERVER:
    case actionTypes.KILL_SERVER_FULFILLED:
    case actionTypes.KILL_SERVER_FAILED:
    case actionTypes.KILL_SERVER_CANCELED:
    case actionTypes.FETCH_KERNEL_SPECS:
    case actionTypes.FETCH_KERNEL_SPECS_FULFILLED:
    case actionTypes.FETCH_KERNEL_SPECS_FAILED:
    case actionTypes.FETCH_KERNEL_SPECS_CANCELED:
    case actionTypes.SET_ACTIVE_KERNEL:
    case actionTypes.SET_RESTART_KERNEL:
    case actionTypes.ACTIVATE_KERNEL:
    case actionTypes.ACTIVATE_KERNEL_FULFILLED:
    case actionTypes.ACTIVATE_KERNEL_FAILED:
    case actionTypes.ACTIVATE_KERNEL_CANCELED:
    case actionTypes.INTERRUPT_KERNEL:
    case actionTypes.INTERRUPT_KERNEL_FULFILLED:
    case actionTypes.INTERRUPT_KERNEL_FAILED:
    case actionTypes.INTERRUPT_KERNEL_CANCELED:
    case actionTypes.KILL_KERNEL:
    case actionTypes.KILL_KERNEL_FULFILLED:
    case actionTypes.KILL_KERNEL_FAILED:
    case actionTypes.KILL_KERNEL_CANCELED: {
      // TODO: add flow type to indicate that id is required
      return {
        ...state,
        [payload.id]: server(state[payload.id], { type, payload })
      };
    }
    default:
      return source;
  }
};

const ui = combineReducers({
  repo,
  gitref,
  source,
  showPanel,
  serverId,
  currentKernelName
});

const entities = combineReducers({
  serversById
});
