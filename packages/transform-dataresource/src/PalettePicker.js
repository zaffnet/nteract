/* @flow */
import * as React from "react";
import { join } from "path";
import { BlockPicker, ChromePicker } from "react-color";

type Props = {
  values: Array<string>,
  colorHash: Object,
  valueHash: Object
};

type State = {
  values: Array<string>,
  colorHash: Object,
  valueHash: Object
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
      selectedPosition: 0
    };
    this.textareaColor = React.createRef();
  }

  openClose = () => {
    this.setState({ open: !this.state.open });
  };

  handleChange = (color, position) => {
    this.setState({ selectedColor: color, selectedPosition: position });
  };

  pickerChange = color => {
    const { colors } = this.props;
    colors[this.state.selectedPosition] = color.hex;
    this.props.updateColor(colors);
    this.setState({ selectedColor: color.hex });
  };

  colorsFromTextarea = () => {
    const rawtextValue = this.textareaColor.current.value;
    const parsedTextValue = rawtextValue
      .replace(/\"/g, "")
      .replace(/ /g, "")
      .replace(/\[/g, "")
      .replace(/\]/g, "")
      .replace(/\r?\n|\r/g, "")
      .split(",");

    console.log("rawtextValue", rawtextValue);
    console.log("parsedTextValue", parsedTextValue);

    this.props.updateColor(parsedTextValue);
  };

  render() {
    if (this.state.open) {
      return (
        <div style={{ marginTop: "20px" }}>
          <button onClick={this.openClose}>Adjust Palette</button>
        </div>
      );
    }

    const { colors } = this.props;

    console.log("colorsjoin", colors.map(d => `"${d}"`).join(","));

    return (
      <div>
        <div style={{ display: "inline-block", width: "300px" }}>
          {colors.map((d, i) => (
            <div
              style={{
                cursor: "pointer",
                width: "30px",
                height: "30px",
                borderRadius: "5px",
                background: d,
                margin: "10px",
                display: "inline-block"
              }}
              onClick={() => this.handleChange(d, i)}
            />
          ))}
        </div>
        <div style={{ display: "inline-block", height: "100%" }}>
          <ChromePicker
            color={this.state.selectedColor}
            onChangeComplete={this.pickerChange}
          />
        </div>
        <div style={{ display: "inline-block", width: "200px" }}>
          <textarea style={{ height: "150px" }} ref={this.textareaColor}>
            {colors.join(",\n")}
          </textarea>
          <button onClick={this.colorsFromTextarea}>Update Colors</button>
        </div>
        <button onClick={this.openClose}>Close Palette</button>
        <a
          href={`http://projects.susielu.com/viz-palette?colors=[${colors
            .map(d => `"${d}"`)
            .join(",")}]&backgroundColor="white"&fontColor="black"`}
        >
          Evaluate This Palette with VIZ PALETTE
        </a>
      </div>
    );
  }
}

export default PalettePicker;
