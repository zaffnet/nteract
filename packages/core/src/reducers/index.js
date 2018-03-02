// @flow
import comms from "./comms";
import config from "./config";
import app from "./app";
import core from "./core";

// TODO: Temporarily export document as an allowable top-level reducer.
import { document } from "./core/entities/contents";

export { document, comms, config, app, core };
