Execute Result

The execute result component, like `DisplayData`, takes in the mimebundle that the `execute_result` message has as part of its payload. The payload looks like this:

```json
{
  "text/plain": "SparkContext ⚡️",
  "text/html": "<b>SparkContext ⚡️</b>"
}
```

The standard practice in Jupyter apps is to pick the "richest" of these. This Component lets
you declare which are the richest in the order they appear as children:

```jsx static
<ExecuteResult data={{ "text/plain": "test data" }}>
  <HTML />
  <Plain />
</ExecuteResult>
```

The following block uses the `<Plain />` output since `text/plain` is the only available.

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

<ExecuteResult data={{ "text/plain": "SparkContext ⚡️" }}>
  <HTML />
  <Plain />
</ExecuteResult>;
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

<ExecuteResult
  data={{
    "text/plain": "plain was richer",
    "text/html": "<b>HTML is so rich</b>"
  }}
>
  <HTML />
  <Plain />
</ExecuteResult>;
```

Without any valid choices, it renders nothing!

```jsx
<ExecuteResult
  data={{
    "text/plain": "plain was richer",
    "text/html": "<b>HTML was richer</b>"
  }}
/>
```

```jsx
<ExecuteResult />
```

### Passing Props

Since these are _just_ React elements as children, we can pass custom props that will pass through on render:

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
  <ExecuteResult
    data={{
      "text/special": "Happy Day"
    }}
  >
    <Special big />
    <Plain />
  </ExecuteResult>
  <ExecuteResult
    data={{
      "text/special": "Happy Day"
    }}
  >
    <Special />
    <Plain />
  </ExecuteResult>
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
        <ExecuteResult
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
        </ExecuteResult>
      </div>
    );
  }
}

<Output />;
```
