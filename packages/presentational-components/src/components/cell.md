All by itself, this component doesn't do anything. Used with `<Input />`, `<Source />`, and `<Outputs />`, it brings styling to the children
based on hover and **selected** states.

```js
const { Input, Outputs, Prompt, Source } = require("../");

<Cell>
  <Input>
    <Prompt counter={1} />
    <Source language="python">{`import pandas as pd\npd.DataFrame([1,2,3])\n\n# Hover over this cell!`}</Source>
  </Input>
  <Outputs>
    <div>
      <style scoped>{`
          .dataframe tbody tr th:only-of-type {
              vertical-align: middle;
          }

          .dataframe tbody tr th {
              vertical-align: top;
          }

          .dataframe thead th {
              text-align: right;
          }
      `}</style>
      <table border="1" className="dataframe">
        <thead>
          <tr style={{ textAlign: "right" }}>
            <th />
            <th>0</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>0</th>
            <td>1</td>
          </tr>
          <tr>
            <th>1</th>
            <td>2</td>
          </tr>
          <tr>
            <th>2</th>
            <td>3</td>
          </tr>
        </tbody>{" "}
      </table>
    </div>
  </Outputs>
</Cell>;
```

A `<Cell />` can be set as selected to **raise** it up.

```js
const { Input, Outputs, Prompt, Source } = require("../");

<Cell isSelected>
  <Input>
    <Prompt counter={2} />
    <Source language="python">{`print("Hello World")`}</Source>
  </Input>
  <Outputs>
    <pre>Hello World</pre>
  </Outputs>
</Cell>;
```

There are three levels to a cell, which can be thought of as raised cards:

1.  Flat on the "page"
2.  Slightly raised up while hovering, mid way to fully active
3.  Raised up highest, when active -- the editor should be focused when this is used

```js
const { Input, Outputs, Prompt, Source, Cells } = require("../");

<Cells>
  <Cell>
    <Input>
      <Prompt />
      <Source language="python">{`# Level 0 - Flat`}</Source>
    </Input>
    <Outputs>
      <pre>Output</pre>
    </Outputs>
  </Cell>
  <Cell _hovered>
    <Input>
      <Prompt />
      <Source language="python">{`# Level 1 - Slight`}</Source>
    </Input>
    <Outputs>
      <pre>Output</pre>
    </Outputs>
  </Cell>
  <Cell isSelected>
    <Input>
      <Prompt />
      <Source language="python">{`# Level 2 - Raised`}</Source>
    </Input>
    <Outputs>
      <pre>Output</pre>
    </Outputs>
  </Cell>
</Cells>;
```
