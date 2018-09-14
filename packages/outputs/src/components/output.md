The `<Output />` element is a glorified Switch statement for picking what to render an output with.

```jsx
// Until we create <Stream />
const StreamText = props => (
  <pre
    style={{
      backgroundColor: props.output.name === "stderr" ? "#f9e0db" : "#e0f9db"
    }}
  >
    {props.output.text}
  </pre>
);

StreamText.defaultProps = {
  outputType: "stream"
};

const output = Object.freeze({
  outputType: "stream",
  text: "Hello World\nHow are you?",
  name: "stdout"
});

<Output output={output}>
  <StreamText />
</Output>;
```

```jsx
const { RichMedia } = require("./rich-media");

const StreamText = props => (
  <pre
    style={{
      backgroundColor: props.output.name === "stderr" ? "#f9e0db" : "#e0f9db"
    }}
  >
    {props.output.text}
  </pre>
);

StreamText.defaultProps = {
  outputType: "stream"
};

// Some "rich" handlers for Media
const Plain = props => <marquee>{props.data}</marquee>;
Plain.defaultProps = {
  mediaType: "text/plain"
};

const HTML = props => <div dangerouslySetInnerHTML={{ __html: props.data }} />;
HTML.defaultProps = {
  mediaType: "text/html"
};

const DisplayData = props => (
  <RichMedia data={props.output.data} metadata={props.output.metadata}>
    {props.children}
  </RichMedia>
);

DisplayData.defaultProps = {
  outputType: "display_data"
};

const outputs = [
  {
    outputType: "stream",
    text: "Hello World\nHow are you?",
    name: "stdout"
  },
  {
    outputType: "display_data",
    data: {
      "text/plain": "O____O"
    },
    metadata: {}
  },
  {
    outputType: "stream",
    text: "Pretty good I would say",
    name: "stdout"
  }
];

<div>
  {outputs.map(output => (
    <Output output={output}>
      <StreamText />
      <DisplayData>
        <Plain />
        <HTML />
      </DisplayData>
    </Output>
  ))}
</div>;
```
