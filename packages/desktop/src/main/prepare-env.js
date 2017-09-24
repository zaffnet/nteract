import shellEnv from "shell-env";

import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/fromPromise";

import "rxjs/add/operator/first";
import "rxjs/add/operator/do";
import "rxjs/add/operator/publishReplay";

// Bring in the current user's environment variables from running a shell session so that
// launchctl on the mac and the windows process manager propagate the proper values for the
// user
//
// TODO: This should be cased off for when the user is already in a proper shell session (possibly launched
//       from the nteract CLI
const env$ = Observable.fromPromise(shellEnv())
  .first()
  .do(env => {
    Object.assign(process.env, env);
  })
  .publishReplay(1);

env$.connect();

export default env$;
