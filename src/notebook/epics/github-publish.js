import { shell } from 'electron';

import {
  PUBLISH_USER_GIST, PUBLISH_ANONYMOUS_GIST
} from './../constants';

import {
  overwriteMetadata,
} from '../actions';

const commutable = require('commutable');
const path = require('path');

const Rx = require('rxjs/Rx');

const Observable = Rx.Observable;

const Github = require('github');


/**
 * Notify the notebook user that it has been published as a gist.
 * @param {string} filename - Filename of the notebook.
 * @param {string} gistID - ID of the published gist, given after URL
 * @param {object} notificationSystem - To be passed information for
 * notification of the user that the gist has been published.
 */
export function notifyUser(filename, gistID, notificationSystem) {
  notificationSystem.addNotification({
    title: 'Gist uploaded',
    message: `${filename} is ready`,
    dismissible: true,
    position: 'tr',
    level: 'success',
    action: {
      label: 'Open Gist',
      callback: function openGist() {
        shell.openExternal(`https://nbviewer.jupyter.org/${gistID}`);
      },
    },
  });
}

/**
 * Callback function to be used in publishNotebookObservable such that the
 * response from the github API can be used for user notification.
 * @param {boolean} firstTimePublish - If false, overwrite gist_id metdata.
 * @param {object} observer - The publishNotebookObserver that will be
 * completed after the callback.
 * @param {string} filename - Filename of the notebook.
 * @param {function} notificationSystem - To be passed information for
 * notification of the user that the gist has been published.
 * @return callbackFunction for use in publishNotebookObservable
 */
export function createGistCallback(store, observer, filename, notificationSystem) {
  return function gistCallback(err, response) {
    if (err) {
      observer.error(err);
      observer.complete();
      return;
    }
    const gistID = response.id;
    store.dispatch(overwriteMetadata('gist_id', gistID));
    notifyUser(filename, gistID, notificationSystem);
  };
}

/**
 * Notebook Observable for the purpose of tracking every time a user
 * wishes to publish a gist.
 * @param {object} github - The github api for authenticating and publishing
 * the gist.
 * @param {object} notebook - The notebook to be converted to its JSON.
 * @param {string} filename - The filename of the notebook to be published.
 * @param {function} notificationSystem - To be passed information for
 * notification of the user that the gist has been published.
 */
export function publishNotebookObservable(github, notebook, filepath,
  notificationSystem, publishAsUser, store) {
  return Rx.Observable.create((observer) => {
    const notebookString = JSON.stringify(
      commutable.toJS(notebook.update('cellMap', cells =>
        cells.map(value =>
          value
            .deleteIn(['metadata', 'inputHidden'])
            .deleteIn(['metadata', 'outputHidden'])
            .delete(['metadata', 'status'])))),
      undefined,
      1);

    const filename = filepath ? path.parse(filepath).base : 'Untitled.ipynb';
    const files = {};
    files[filename] = { content: notebookString };

    if (publishAsUser) {
      github.users.get({}, (err, res) => {
        if (err) throw err;
        notificationSystem.addNotification({
          title: 'Authenticated',
          message: `Authenticated as ${res.login}`,
          level: 'info',
        });
      });
    }
    notificationSystem.addNotification({
      title: 'Uploading gist...',
      message: 'Your notebook is being uploaded as a GitHub gist',
      level: 'info',
    });
    console.log(notebook.hasIn(['metadata', 'gist_id']))
    // Already in a gist, update the gist
    const gistRequest = notebook.hasIn(['metadata', 'gist_id']) ?
      { files, id: notebook.getIn(['metadata', 'gist_id']), public: false } :
      { files, public: false };
    if (gistRequest.id) {
      console.log(gistRequest)
      github.gists.edit(gistRequest,
        createGistCallback(store, observer, filename, notificationSystem));
    } else {
      github.gists.create(gistRequest,
        createGistCallback(store, observer, filename, notificationSystem));
    }
    observer.complete();
  });
}

/**
 * Handle gist errors for the publish epic.
 * @param  {String} error - Error response to be parsed and handled.
 *
 */
export function handleGistError(err) {
  return Observable.of({ type: 'ERROR', payload: err, err: true });
}

/**
 * Handle user vs. anonymous gist actions in publishEpic
 * @param {action} action - The action being processed by the epic.
 * @param {store} reduxStore - The store containing state data.
 * return {Observable} publishNotebookObservable with appropriate parameters.
*/
export function handleGistAction(action, store) {
  const github = new Github();
  const state = store.getState();
  const notebook = state.document.get('notebook');
  const filename = state.metadata.get('filename');
  const notificationSystem = state.app.get('notificationSystem');
  let publishAsUser = false;
  if (action.type === 'PUBLISH_USER_GIST') {
    const githubToken = state.app.get('token');
    github.authenticate({ type: 'oauth', token: githubToken });
    publishAsUser = true;
  }
  return publishNotebookObservable(github, notebook, filename,
                                   notificationSystem, publishAsUser, store);
}

/**
 * Epic to capture the end to end action of publishing and receiving the
 * response from the Github API.
 */
export const publishEpic = (action$, store) =>
  action$.ofType(PUBLISH_USER_GIST, PUBLISH_ANONYMOUS_GIST)
    .mergeMap((action) => handleGistAction(action, store))
    .catch(handleGistError);
