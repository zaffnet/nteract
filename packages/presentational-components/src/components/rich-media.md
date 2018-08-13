### Media Bundles

Jupyter kernels are able to emit rich [media](https://www.iana.org/assignments/media-types/media-types.xhtml) like images, json, text, html, and many others. They're the core of what makes notebooks and consoles _so expressive_. They're sent over the jupyter messaging protocol and stored in the notebook just like this:

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

This object structure is called a **media bundle** (formerly known as a mimebundle), so dubbed because it's a bundle of [media types types](https://www.iana.org/assignments/media-types/media-types.xhtml) and associated data. Jupyter frontends pick the _richest_ media type amongst these for rendering for the user, by selecting via a **display order**.

As an example, if the display order is:

```json
["text/html", "application/json", "text/plain"]
```

Then the frontend will prefer HTML instead of JSON and JSON over plaintext. To render any one of these, we write a React Element that takes at least the prop `data`:

```jsx static
const Plain = props => <pre>{props.data}</pre>;

Plain.defaulProps = {
  mediaType: "text/plain"
};
```

They can also accept `metadata` if there is additional configuration allowed. Take for example images which allow setting the size via `metadata`:

```jsx static
const ImageMedia = props => (
  <img
    alt=""
    src={`data:${props.mediatype};base64,${props.data}`}
    {...props.metadata.size}
  />
);
ImageMedia.defaultProps = {
  mediaType: "image/png"
};
```

There are several different jupyter message types that include these objects:

- [`execute_result`](http://jupyter-client.readthedocs.io/en/stable/messaging.html#id6)
- [`display_data`](http://jupyter-client.readthedocs.io/en/stable/messaging.html#display-data) and [`update_display_data`](http://jupyter-client.readthedocs.io/en/stable/messaging.html#update-display-data)
- [`inspect_reply`](http://jupyter-client.readthedocs.io/en/stable/messaging.html#introspection)
- [`payload`'s `page`](http://jupyter-client.readthedocs.io/en/stable/messaging.html#payloads-deprecated)

### Displaying Rich Media with `<RichMedia />`

The `<RichMedia />` component accepts the whole media bundle from a kernel via the `data` prop and all the elements for rendering media types as `children`. The order of the children states their richness from highest to lowest.

```jsx static
<RichMedia data={{ "text/plain": "SparkContext ⚡️" }}>
  <HTML />
  <Plain />
</RichMedia>
```

The `<RichMedia />` component will pass the appropriate data from the media bundle to the element that accepts the media type. In this case, `<Plain />` is picked as the richest since `text/plain` is the only available. `"SparkContext ⚡️"` is passed as `<Plain data="SparkContext ⚡️" />` to render the richest media.

```jsx
/* Custom transforms */
const Plain = props => <pre>{props.data}</pre>;
Plain.defaultProps = {
  mediaType: "text/plain"
};

const HTML = props => <div dangerouslySetInnerHTML={{ __html: props.data }} />;
HTML.defaultProps = {
  mediaType: "text/html"
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
  mediaType: "text/plain"
};

const HTML = props => <div dangerouslySetInnerHTML={{ __html: props.data }} />;
HTML.defaultProps = {
  mediaType: "text/html"
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

### Passing Props

Since the children are React elements, we can pass custom props that will get rendered with the data:

```
/* Custom transforms */
const Special = props => props.big ? <h1>Big {props.data}</h1> : <p>Small {props.data}</p>
Special.defaultProps = {
  big: false,
  mediaType: "text/special"
}

const Plain = props => <pre>{props.data}</pre>;
Plain.defaultProps = {
  mediaType: "text/plain"
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
  mediaType: "text/plain"
};

const HTML = props => <div dangerouslySetInnerHTML={{ __html: props.data }} />;
HTML.defaultProps = {
  mediaType: "text/html"
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
  mediaType: "fancy/table"
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
