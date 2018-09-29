```jsx
var MathJax = require(".");

const tex = String.raw`f(x) = \int_{-\infty}^\infty
    \hat f(\xi)\,e^{2 \pi i \xi x}
    \,d\xi`;

<MathJax.Provider>
  <p>
    This is an inline math formula: <MathJax.Node inline>a = b</MathJax.Node>
    <span> and a block one:</span>
    <MathJax.Node>{tex}</MathJax.Node>
  </p>
</MathJax.Provider>;
```

What happens if you use a consumer and have no provider???

```jsx
var MathJax = require(".");

<MathJax.Node>a = b</MathJax.Node>;
```
