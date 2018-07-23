/* @flow */
import * as React from "react";
import { join } from "path";
import { BlockPicker, ChromePicker } from "react-color";

type Props = {
  colors: Array<string>,
  updateColor: Function
};

type State = {
  colors: string,
  selectedColor: string,
  open: boolean,
  selectedPosition: number
};

class PalettePicker extends React.Component<Props, State> {
  static defaultProps = {
    metadata: {},
    height: 500
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      open: false,
      selectedColor: props.colors[0],
      selectedPosition: 0,
      colors: props.colors.join(",\n")
    };
  }

  openClose = () => {
    this.setState({
      open: !this.state.open,
      colors: this.props.colors.join(",\n")
    });
  };

  handleChange = (color: string, position: number) => {
    this.setState({ selectedColor: color, selectedPosition: position });
  };

  pickerChange = (color: Object) => {
    const { colors } = this.props;
    colors[this.state.selectedPosition] = color.hex;
    this.props.updateColor(colors);
    this.setState({ selectedColor: color.hex, colors: colors.join(",\n") });
  };

  colorsFromTextarea = () => {
    const parsedTextValue = this.state.colors
      .replace(/\"/g, "")
      .replace(/ /g, "")
      .replace(/\[/g, "")
      .replace(/\]/g, "")
      .replace(/\r?\n|\r/g, "")
      .split(",");

    this.props.updateColor(parsedTextValue);
  };

  updateTextArea = (e: Object) => {
    this.setState({ colors: e.target.value });
  };

  render() {
    if (!this.state.open) {
      return (
        <div style={{ display: "inline-block" }}>
          <button onClick={this.openClose}>Adjust Palette</button>
        </div>
      );
    }

    const { colors } = this.props;

    return (
      <div
        style={{
          borderRadius: "5px",
          border: "solid black 1px",
          margin: "10px",
          padding: "10px",
          textAlign: "center"
        }}
      >
        <div style={{ height: 0, textAlign: "right" }}>
          <button onClick={this.openClose}>close</button>
        </div>
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-around",
            alignItems: "stretch"
          }}
        >
          <div style={{ flex: "2 0px" }}>
            <h3>Select Color</h3>
            {colors.map((d, i) => (
              <div
                key={`color-${i}`}
                style={{
                  cursor: "pointer",
                  width: "30px",
                  height: "30px",
                  borderRadius: "5px",
                  background: d,
                  margin: "10px",
                  display: "inline-block"
                }}
                role="button"
                tabindex="0"
                onKeyPress={(e: Object) => {
                  if (e.keyCode === 13) {
                    this.handleChange(d, i);
                  }
                }}
                onClick={() => this.handleChange(d, i)}
              />
            ))}
          </div>
          <div style={{ flex: "1 0px", height: "100%" }}>
            <h3>Adjust Color</h3>
            <div style={{ margin: "auto", width: "225px" }}>
              <ChromePicker
                color={this.state.selectedColor}
                onChangeComplete={this.pickerChange}
              />
            </div>
          </div>
          <div style={{ flex: "1 0px" }}>
            <h3>Paste New Colors</h3>
            <textarea
              style={{ height: "184px", width: "100%", minWidth: "200px" }}
              value={this.state.colors}
              onChange={this.updateTextArea}
            />
            <button onClick={this.colorsFromTextarea}>Update Colors</button>
          </div>
        </div>
        <div style={{ margin: "20px 0 10px" }}>
          <a
            href={`http://projects.susielu.com/viz-palette?colors=[${colors
              .map(d => `"${d}"`)
              .join(",")}]&backgroundColor="white"&fontColor="black"`}
          >
            Evaluate This Palette with VIZ PALETTE
          </a>
        </div>
      </div>
    );
  }
}

export default PalettePicker;
