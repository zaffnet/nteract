# Maths via MathJax

```jsx
var MathJax = require(".");
const tex = String.raw`f(x) = \int_{-\infty}^\infty
    \hat f(\xi)\,e^{2 \pi i \xi x}
    \,d\xi`;
<MathJax.Context>
  <div>
    This is an inline math formula: <MathJax.Node inline>a = b</MathJax.Node>
    and a block one:
    <MathJax.Node>{tex}</MathJax.Node>
  </div>
</MathJax.Context>;
```
