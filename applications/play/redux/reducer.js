import { combineReducers } from "redux";
import * as actionTypes from "./actionTypes";

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

const ui = combineReducers({
  repo,
  gitref,
  source,
  showPanel,
  serverId,
  currentKernelName
});
