// @flow
import * as React from "react";
import RichestMime from "../richest-mime";

type Props = {
  displayOrder: Array<string>,
  transforms: Object,
  theme: string,
  models: Object,
  onMetadataChange?: () => void,
  data: Object,
  metadata: Object
};

export const ExecuteResultOutputComponent = (props: Props) => {
  return (
    <RichestMime
      bundle={props.data}
      metadata={props.metadata}
      displayOrder={props.displayOrder}
      transforms={props.transforms}
      theme={props.theme}
      models={props.models}
    />
  );
};
