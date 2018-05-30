This is a CSS behavioral component

```js
const { Input, Outputs, Prompt, Source } = require('../');

<Cell>
  <Input>
    <Prompt />
    <Source>{`import pandas as pd; pd.DataFrame()`}</Source>
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
        <tr style={{textAlign: "right"}}>
          <th></th>
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
      </tbody>      </table>
    </div>
  </Outputs>
</Cell>
```
