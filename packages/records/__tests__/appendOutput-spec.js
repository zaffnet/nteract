import { appendOutput } from "../src/reducers/outputs.js";

describe("appendOutput", () => {
  test("puts new outputs at the end by default", () => {
    const outputs = [
      { outputType: "stream", name: "stdout", text: "Woo" },
      {
        outputType: "error",
        ename: "well",
        evalue: "actually",
        traceback: []
      }
    ];
    const newOutputs = appendOutput(outputs, {
      outputType: "displayData",
      data: {},
      metadata: {}
    });

    expect(JSON.stringify(newOutputs)).toEqual(
      JSON.stringify([
        { outputType: "stream", name: "stdout", text: "Woo" },
        {
          outputType: "error",
          ename: "well",
          evalue: "actually",
          traceback: []
        },
        {
          outputType: "displayData",
          data: {},
          metadata: {}
        }
      ])
    );
  });

  test("handles the case of a single stream output", () => {
    const outputs = [{ name: "stdout", text: "hello", outputType: "stream" }];
    const newOutputs = appendOutput(outputs, {
      name: "stdout",
      text: " world",
      outputType: "stream"
    });

    expect(JSON.stringify(newOutputs)).toBe(
      JSON.stringify([
        { name: "stdout", text: "hello world", outputType: "stream" }
      ])
    );
  });

  test("merges streams of text", () => {
    let outputs = [];

    outputs = appendOutput(outputs, {
      name: "stdout",
      text: "hello",
      outputType: "stream"
    });

    expect(
      Object.is(
        JSON.stringify(outputs),
        JSON.stringify([
          { name: "stdout", text: "hello", outputType: "stream" }
        ])
      )
    ).toBe(true);
  });

  test("keeps respective streams together", () => {
    const outputs = [
      { name: "stdout", text: "hello", outputType: "stream" },
      { name: "stderr", text: "errors are", outputType: "stream" }
    ];
    const newOutputs = appendOutput(outputs, {
      name: "stdout",
      text: " world",
      outputType: "stream"
    });

    expect(JSON.stringify(newOutputs)).toBe(
      JSON.stringify([
        { name: "stdout", text: "hello world", outputType: "stream" },
        { name: "stderr", text: "errors are", outputType: "stream" }
      ])
    );

    const evenNewerOutputs = appendOutput(newOutputs, {
      name: "stderr",
      text: " informative",
      outputType: "stream"
    });

    expect(JSON.stringify(evenNewerOutputs)).toBe(
      JSON.stringify([
        { name: "stdout", text: "hello world", outputType: "stream" },
        {
          name: "stderr",

          text: "errors are informative",
          outputType: "stream"
        }
      ])
    );
  });
});
