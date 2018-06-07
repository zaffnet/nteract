// @flow
import * as nteractRecords from "@nteract/records";

describe("stream output", () => {
  test("can be converted from nbformat", () => {
    expect(
      nteractRecords.outputFromNbformat({
        output_type: "stream",
        name: "stdout",
        text: ["sup\n", "yall"]
      })
    ).toEqual(
      nteractRecords.makeStreamOutputRecord({
        outputType: "stream",
        name: "stdout",
        text: "sup\nyall"
      })
    );
  });

  test("can be converted from jupyter messages", () => {
    expect(
      nteractRecords.streamRecordFromMessage({
        header: {
          msg_type: "stream"
        },
        content: {
          name: "stdout",
          text: "it is love we must hold on to\nnever easy but we try"
        }
      })
    ).toEqual(
      nteractRecords.makeStreamOutputRecord({
        outputType: "stream",
        name: "stdout",
        text: "it is love we must hold on to\nnever easy but we try"
      })
    );
  });
});

describe("display_data output", () => {
  test("can be converted from nbformat", () => {
    expect(
      nteractRecords.outputFromNbformat({
        output_type: "display_data",
        data: {
          infinityStones: [
            "mind\n",
            "time\n",
            "space\n",
            "reality\n",
            "power\n",
            "soul"
          ]
        },
        metadata: { "application/json": { expanded: true } }
      })
    ).toEqual(
      nteractRecords.makeDisplayDataOutputRecord({
        outputType: "display_data",
        data: {
          infinityStones: [
            "mind\n",
            "time\n",
            "space\n",
            "reality\n",
            "power\n",
            "soul"
          ]
        },
        metadata: { "application/json": { expanded: true } }
      })
    );
  });

  test("can be converted from jupyter messages", () => {
    expect(
      nteractRecords.displayDataRecordFromMessage({
        header: {
          msg_type: "display_data"
        },
        content: {
          data: { anotherDay: "anotherDoug" },
          metadata: { "application/json": { expanded: true } }
        }
      })
    ).toEqual(
      nteractRecords.makeDisplayDataOutputRecord({
        outputType: "display_data",
        data: { anotherDay: "anotherDoug" },
        metadata: { "application/json": { expanded: true } }
      })
    );
  });
});

describe("execute_result output", () => {
  test("can be converted from nbformat", () => {
    expect(
      nteractRecords.outputFromNbformat({
        output_type: "execute_result",
        execute_result: 7,
        data: {
          infinityStones: [
            "mind\n",
            "time\n",
            "space\n",
            "reality\n",
            "power\n",
            "soul"
          ]
        },
        metadata: { "application/json": { expanded: true } }
      })
    ).toEqual(
      nteractRecords.makeExecuteResultOutputRecord({
        outputType: "execute_result",
        execute_result: 7,
        data: {
          infinityStones: [
            "mind\n",
            "time\n",
            "space\n",
            "reality\n",
            "power\n",
            "soul"
          ]
        },
        metadata: { "application/json": { expanded: true } }
      })
    );
  });

  test("can be converted from jupyter messages", () => {
    expect(
      nteractRecords.executeResultRecordFromMessage({
        header: {
          msg_type: "execute_result"
        },
        content: {
          data: { anotherDay: "anotherDoug" },
          metadata: { "application/json": { expanded: false } }
        }
      })
    ).toEqual(
      nteractRecords.makeExecuteResultOutputRecord({
        outputType: "execute_result",
        data: { anotherDay: "anotherDoug" },
        metadata: { "application/json": { expanded: false } }
      })
    );
  });
});
