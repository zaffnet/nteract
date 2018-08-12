Jupyter kernels are able to emit rich media like images, json, text, html, and many other media types. They're the core of what makes notebooks and consoles so expressive. They're sent over the jupyter messaging protocol and stored in the notebook just like this:

```json
{
  "text/plain": "SparkContext ⚡️",
  "text/html": "<b>SparkContext ⚡️</b>",
  "application/json": {
    "spark": "awesome ⚡️",
    "version": 2
  }
}
```

There are several different jupyter message types that include these objects:

- [`execute_result`](http://jupyter-client.readthedocs.io/en/stable/messaging.html#id6)
- [`display_data`](http://jupyter-client.readthedocs.io/en/stable/messaging.html#display-data) and [`update_display_data`](http://jupyter-client.readthedocs.io/en/stable/messaging.html#update-display-data)
- [`inspect_reply`](http://jupyter-client.readthedocs.io/en/stable/messaging.html#introspection)
- [`payload`'s `page`](http://jupyter-client.readthedocs.io/en/stable/messaging.html#payloads-deprecated)

This object structure is called a "mimebundle", so dubbed because it's a bundle of [MIME types](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types) and associated data. The standard practice in Jupyter apps is to pick the "richest" of these for rendering. The `<RichMedia />` component accepts the `data` from a kernel as a prop and all the renderers / transforms as `children`. The order of the children states their richness from highest to lowest.

```jsx static
<RichMedia data={{ "text/plain": "test data" }}>
  <HTML />
  <Plain />
</RichMedia>
```

The following block uses the `<Plain />` output since `text/plain` is the only key in the `data` object.

```jsx
/* Custom transforms */
const Plain = props => <pre>{props.data}</pre>;
Plain.defaultProps = {
  mimetype: "text/plain"
};

const HTML = props => <div dangerouslySetInnerHTML={{ __html: props.data }} />;
HTML.defaultProps = {
  mimetype: "text/html"
};

<RichMedia data={{ "text/plain": "SparkContext ⚡️" }}>
  <HTML />
  <Plain />
</RichMedia>;
```

Whereas this output has a richer HTML output:

```jsx
/* Custom transforms */
const Plain = props => <pre>{props.data}</pre>;
Plain.defaultProps = {
  mimetype: "text/plain"
};

const HTML = props => <div dangerouslySetInnerHTML={{ __html: props.data }} />;
HTML.defaultProps = {
  mimetype: "text/html"
};

<RichMedia
  data={{
    "text/plain": "plain was richer",
    "text/html": "<b>HTML is so rich</b>"
  }}
>
  <HTML />
  <Plain />
</RichMedia>;
```

Without any valid choices, it renders nothing!

```jsx
<RichMedia
  data={{
    "text/plain": "plain was richer",
    "text/html": "<b>HTML was richer</b>"
  }}
/>
```

```jsx
<RichMedia />
```

### Passing Props

Since the children are React elements, we can pass custom props that will get rendered with the data:

```
/* Custom transforms */
const Special = props => props.big ? <h1>Big {props.data}</h1> : <p>Small {props.data}</p>
Special.defaultProps = {
  big: false,
  mimetype: "text/special"
}

const Plain = props => <pre>{props.data}</pre>;
Plain.defaultProps = {
  mimetype: "text/plain"
};


<div>
  <RichMedia
    data={{
      "text/special": "Happy Day"
    }}
  >
    <Special big />
    <Plain />
  </RichMedia>
  <RichMedia
    data={{
      "text/special": "Happy Day"
    }}
  >
    <Special />
    <Plain />
  </RichMedia>
</div>
```

Which means that you can customize outputs as props!

```jsx
const Plain = props => <pre>{props.data}</pre>;
Plain.defaultProps = {
  mimetype: "text/plain"
};

const HTML = props => <div dangerouslySetInnerHTML={{ __html: props.data }} />;
HTML.defaultProps = {
  mimetype: "text/html"
};

// Pretend this is the data explorer :)
const FancyTable = props => (
  <table style={{ border: `2px solid ${props.color}` }}>
    {props.data.map(row => (
      <tr>
        {row.map(datum => (
          <td style={{ border: `1px dashed ${props.color}` }}>{datum}</td>
        ))}
      </tr>
    ))}
  </table>
);

FancyTable.defaultProps = {
  mimetype: "fancy/table"
};

class Output extends React.Component {
  constructor(props) {
    super(props);
    this.state = { color: "#e66465" };
  }

  render() {
    return (
      <div>
        <div style={{ marginBottom: "20px" }}>
          <label>Pick a color for the table </label>
          <input
            type="color"
            value={this.state.color}
            onChange={e => this.setState({ color: e.target.value })}
          />
        </div>
        <RichMedia
          data={{
            "text/plain": "1,2,3\n4,5,6\n",
            "text/html":
              "<table><tr><td>1</td><td>2</td><td>3</td></tr><tr><td>4</td><td>5</td><td>6</td></tr></table>",
            "fancy/table": [[1, 2, 3], [4, 5, 6]]
          }}
        >
          <FancyTable color={this.state.color} />
          <HTML />
          <Plain />
        </RichMedia>
      </div>
    );
  }
}

<Output />;
```
