// @flow strict
import * as React from "react";

import { RichMedia } from "./rich-media";

import type { DisplayDataProps } from "@nteract/records";
type Props = DisplayDataProps;

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
