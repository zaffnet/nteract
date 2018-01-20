import { of } from "rxjs/observable/of";
import { Subject } from "rxjs/Subject";

// Mock response generated 01/24/2018, may need updating.
const mockListReponse = {
  default: "python3",
  kernelspecs: {
    nteract: {
      name: "nteract",
      spec: {
        argv: [
          "/Users/dtrump/venvs/nteract/bin/python",
          "-m",
          "ipykernel_launcher",
          "-f",
          "{connection_file}"
        ],
        env: {},
        display_name: "Python 3 (nteract)",
        language: "python",
        interrupt_mode: "signal",
        metadata: {}
      },
      resources: {
        "logo-32x32": "/kernelspecs/nteract/logo-32x32.png",
        "logo-64x64": "/kernelspecs/nteract/logo-64x64.png"
      }
    },
    python3: {
      name: "python3",
      spec: {
        argv: ["python", "-m", "ipykernel_launcher", "-f", "{connection_file}"],
        env: {},
        display_name: "Python 3",
        language: "python",
        interrupt_mode: "signal",
        metadata: {}
      },
      resources: {
        "logo-32x32": "/kernelspecs/python3/logo-32x32.png",
        "logo-64x64": "/kernelspecs/python3/logo-64x64.png"
      }
    }
  }
};

module.exports = {
  kernels: {
    start: (config, kernelSpecName, cwd) => of({ response: { id: "0" } }),
    connect: (config, id, session) => new Subject()
  },
  kernelspecs: {
    list: config => of({ response: mockListReponse })
  }
};
