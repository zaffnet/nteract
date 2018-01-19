import createImmutableMapReducer from "../../src/reducers/createImmutableMapReducer";
import { Map, Record } from "immutable";
import { combineReducers } from "redux-immutable";

const appRecordFactory = Record({ resourcesById: Map() });
const resourceRecordFactory = Record({ exists: false, name: "" });

describe("createImmutableMapReducer", () => {
  it("can be used with redux-immutable's combineReducers w/ Records", () => {
    const exists = (state, action) => {
      if (action.type === "RESOURCE/CREATE") {
        return true;
      }
      return state;
    };

    const name = (state, action) => {
      if (action.type === "RESOURCE/NAME") {
        return action.name;
      }
      return state;
    };

    const resource = combineReducers({ exists, name }, resourceRecordFactory);

    const getKey = action => action.resourceId;
    const resourcesById = createImmutableMapReducer(getKey, resource);
    const rootReducer = combineReducers({ resourcesById }, appRecordFactory);

    // Test initialization:
    //   1. Our top-level state should be a Record instance now.
    //   2. The resourcesById should *not* be a Record instance (should be Map).
    //   3. Since there we now matches in getKey, we should have no resources.
    const state0 = rootReducer(undefined, { type: "INIT" });
    expect(Record.isRecord(state0)).toBe(true);
    expect(Map.isMap(state0.resourcesById)).toBe(true);
    expect(state0.resourcesById.size).toBe(0);

    // Create a resource:
    //   1. We should now have a single resource.
    //   2. That resource should be a Record instance.
    //   3. That resource should have been created (exists = true).
    //   4. That resource should not have a name yet (name = "").
    const state1 = rootReducer(state0, {
      type: "RESOURCE/CREATE",
      resourceId: "a"
    });
    expect(state1.resourcesById.size).toBe(1);
    expect(Record.isRecord(state1.resourcesById.get("a"))).toBe(true);
    expect(state1.resourcesById.get("a").exists).toBe(true);
    expect(state1.resourcesById.get("a").name).toBe("");

    // Name the resource:
    //   1. No new fields should have been created.
    //   2. Exists state should not have changed.
    //   3. Name state should be updated.
    const state2 = rootReducer(state1, {
      type: "RESOURCE/NAME",
      resourceId: "a",
      name: "kewl"
    });
    expect(state2.resourcesById.size).toBe(1);
    expect(state2.resourcesById.get("a").exists).toBe(true);
    expect(state2.resourcesById.get("a").name).toBe("kewl");

    // Failing to provide something getKey can interpret:
    //  1. State should literally be the same since nothing changes ( === ).
    const state3 = rootReducer(state2, {
      type: "RESOURCE/NAME",
      name: "does not work"
    });
    expect(state3).toBe(state2);
  });
});
