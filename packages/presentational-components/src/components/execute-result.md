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

<ExecuteResult data={{ "text/plain": "test data" }}>
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
