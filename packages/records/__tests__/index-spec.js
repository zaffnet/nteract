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
          infinityStones: "mind\ntime\nspace\nreality\npower\nsoul"
        },
        metadata: {
          "application/json": { expanded: true }
        }
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
        execution_count: 7,
        data: {
          planets: ["xandar\n", "nidavellir\n", "terra"]
        },
        metadata: { "application/json": { expanded: true } }
      })
    ).toEqual(
      nteractRecords.makeExecuteResultOutputRecord({
        outputType: "execute_result",
        executionCount: 7,
        data: {
          planets: "xandar\nnidavellir\nterra"
        },
        metadata: {
          "application/json": { expanded: true }
        }
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

describe("error output", () => {
  test("can be converted from nbformat", () => {
    expect(
      nteractRecords.outputFromNbformat({
        output_type: "error",
        ename: "Thor",
        evalue: "Pirate Angel",
        traceback: ["sweet", "rabbit"]
      })
    ).toEqual(
      nteractRecords.makeErrorOutputRecord({
        output_type: "error",
        ename: "Thor",
        evalue: "Pirate Angel",
        traceback: ["sweet", "rabbit"]
      })
    );
  });

  test("can be converted from jupyter messages", () => {
    expect(
      nteractRecords.errorRecordFromMessage({
        header: {
          msg_type: "error"
        },
        content: {
          ename: "cats",
          evalue: "good",
          traceback: ["squirrel"]
        }
      })
    ).toEqual(
      nteractRecords.makeErrorOutputRecord({
        outputType: "error",
        ename: "cats",
        evalue: "good",
        traceback: ["squirrel"]
      })
    );
  });
});

describe("code cell", () => {
  test("can be converted from nbformat", () => {
    expect(
      nteractRecords.cellFromNbformat({
        cell_type: "code",
        metadata: {
          collapsed: false,
          outputHidden: false,
          inputHidden: false
        },
        executionCount: 2,
        source: [],
        outputs: []
      })
    ).toEqual(
      nteractRecords.makeCodeCellRecord({
        cellType: "code",
        metadata: {
          collapsed: false,
          outputHidden: false,
          inputHidden: false
        },
        executionCount: 2,
        source: [],
        outputs: []
      })
    );
  });
});

describe("markdown cell", () => {
  test("can be converted from nbformat", () => {
    expect(
      nteractRecords.cellFromNbformat({
        cell_type: "markdown",
        metadata: {
          collapsed: false,
          outputHidden: false,
          inputHidden: false
        },
        source: []
      })
    ).toEqual(
      nteractRecords.makeMarkdownCellRecord({
        cellType: "markdown",
        metadata: {
          collapsed: false,
          outputHidden: false,
          inputHidden: false
        },
        source: []
      })
    );
  });
});

describe("raw cell", () => {
  test("can be converted from nbformat", () => {
    expect(
      nteractRecords.cellFromNbformat({
        cell_type: "raw",
        metadata: {
          collapsed: false,
          outputHidden: false,
          inputHidden: false
        },
        source: []
      })
    ).toEqual(
      nteractRecords.makeRawCellRecord({
        cellType: "raw",
        metadata: {
          collapsed: false,
          outputHidden: false,
          inputHidden: false
        },
        source: []
      })
    );
  });
});
