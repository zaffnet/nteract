// @flow strict
import * as React from "react";

import { RichMedia } from "./rich-media";

import type { DisplayDataOutput } from "@nteract/records";
type Props = DisplayDataOutput;

export const DisplayData = (props: Props) => {
  const { data, metadata, children } = props;

  return (
    <RichMedia data={data} metadata={metadata}>
      {children}
    </RichMedia>
  );
};

DisplayData.defaultProps = {
  outputType: "display_data",
  data: {},
  metadata: {}
};
