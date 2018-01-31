// @flow

import * as React from "react";
import styles from "@nteract/styles";

class Styles extends React.Component<*> {
  render() {
    return (
      <React.Fragment>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        {this.props.children}
      </React.Fragment>
    );
  }
}

export default Styles;
