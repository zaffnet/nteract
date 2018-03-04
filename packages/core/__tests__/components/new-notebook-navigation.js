// @flow

import React from "react";
import renderer from "react-test-renderer";
import { shallow, mount } from "enzyme";
import { NewNotebookNavigation } from "../../src/components/new-notebook-navigation";

import { List, Map, Record } from "immutable";

describe("NewNotebookNavigation", () => {
  test("snapshots", () => {
    const availableNotebooks = [
      {
        kernelspec: {
          name: "python3",
          language: "python",
          displayName: "Python 3",
          metadata: Map(),
          env: Map(),
          argv: List(),
          resources: Map(),
          interruptMode: "yes"
        }
      },
      {
        kernelspec: {
          name: "scala211",
          language: "scala",
          displayName: "Scala 2.11",
          metadata: Map(),
          env: Map(),
          argv: List(),
          resources: Map(),
          interruptMode: "yes"
        }
      },
      {
        kernelspec: {
          name: "python2",
          language: "python",
          displayName: "Python 2",
          metadata: Map(),
          env: Map(),
          argv: List(),
          resources: Map(),
          interruptMode: "yes"
        }
      }
    ];

    const selectKernelspec = jest.fn();

    const component = renderer.create(
      <NewNotebookNavigation
        availableNotebooks={availableNotebooks}
        onClick={selectKernelspec}
      />
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
