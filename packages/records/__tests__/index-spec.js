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
