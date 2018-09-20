import * as React from "react";
import { shallow } from "enzyme";

import { Output, StreamText, JupyterError } from "../src";

describe("Output", () => {
  it("handles stream data", () => {
    const output = { outputType: "stream", name: "stdout", text: "hey" };

    const component = shallow(
      <Output output={output}>
        <StreamText />
      </Output>
    );
    console.log(component);
    expect(component.type()).toEqual(StreamText);
  });

  it("handles errors/tracebacks", () => {
    const output = {
      outputType: "error",
      traceback: ["Yikes, Will is in the upsidedown again!"],
      ename: "NameError",
      evalue: "Yikes!"
    };

    const component = shallow(
      <Output output={output}>
        <JupyterError />
      </Output>
    );
    expect(component.type()).toEqual(JupyterError);

    const outputNoTraceback = {
      outputType: "error",
      ename: "NameError",
      evalue: "Yikes!"
    };

    const component2 = shallow(
      <Output output={output}>
        <JupyterError />
      </Output>
    );
    expect(component2.type()).toEqual(JupyterError);
  });
});
