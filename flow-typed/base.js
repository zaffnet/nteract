// @flow

declare type PrimitiveImmutable = string | number | boolean | null;
declare type JSONType = PrimitiveImmutable | JSONObject | JSONArray; // eslint-disable-line no-use-before-define
declare type JSONObject = { [key: string]: JSONType };
declare type JSONArray = Array<JSONType>;
