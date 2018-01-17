import { of } from "rxjs/observable/of";
import { Subject } from "rxjs/Subject";

module.exports = {
  kernels: {
    start: (config, kernelSpecName, cwd) => of({ response: { id: "0" } }),
    connect: (config, id, session) => new Subject()
  }
};
