// @flow
import {
  makeContentCommunicationRecord,
  makeContentsCommunicationRecord
} from "../../../state/communication/contents";
import * as actionTypes from "../../../actionTypes";
import { combineReducers } from "redux-immutable";
import * as Immutable from "immutable";

const byRef = (state = Immutable.Map(), action) => {
  switch (action.type) {
    case actionTypes.FETCH_CONTENT:
      // TODO: #2618
      if (!action.payload.contentRef) {
        return state;
      }
      return state.set(
        action.payload.contentRef,
        makeContentCommunicationRecord({
          loading: true,
          saving: false,
          error: null
        })
      );
    case actionTypes.FETCH_CONTENT_FULFILLED:
      // TODO: #2618
      if (!action.payload.contentRef) {
        return state;
      }
      return state.set(
        action.payload.contentRef,
        makeContentCommunicationRecord({
          loading: false,
          saving: false,
          error: null
        })
      );
    case actionTypes.FETCH_CONTENT_FAILED:
      // TODO: #2618
      if (!action.payload.contentRef) {
        return state;
      }
      return state.set(
        action.payload.contentRef,
        makeContentCommunicationRecord({
          loading: false,
          saving: false,
          error: action.payload.error
        })
      );
    case actionTypes.SAVE:
    case actionTypes.SAVE_AS:
      // TODO: #2618
      if (!action.payload.contentRef) {
        return state;
      }
      return state.set(
        action.payload.contentRef,
        makeContentCommunicationRecord({
          loading: false,
          saving: true,
          error: null
        })
      );
    case actionTypes.SAVE_FULFILLED:
      // TODO: #2618
      if (!action.payload.contentRef) {
        return state;
      }
      return state.set(
        action.payload.contentRef,
        makeContentCommunicationRecord({
          loading: false,
          saving: false,
          error: null
        })
      );
    case actionTypes.SAVE_FAILED:
      // TODO: #2618
      if (!action.payload.contentRef) {
        return state;
      }
      return state.set(
        action.payload.contentRef,
        makeContentCommunicationRecord({
          loading: false,
          saving: false,
          error: action.payload.error
        })
      );
    default:
      return state;
  }
};

export const contents = combineReducers(
  { byRef },
  makeContentsCommunicationRecord
);
