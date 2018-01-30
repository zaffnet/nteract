import * as actionTypes from "../actionTypes";
import { combineReducers } from "redux-immutable";
import * as Immutable from "immutable";

const modalType = (state = "", action) => {
  switch (action.type) {
    case actionTypes.OPEN_MODAL:
      return action.payload.modalType;
    case actionTypes.CLOSE_MODAL:
      return "";
    default:
      return state;
  }
};

const makeModals = Immutable.Record({ modalType: "" });
const modals = combineReducers({ modalType }, makeModals);

export default modals;
