The `Pagers` component is a container component that serves as the container for the pagers of a cell. Pagers are generally used to display information that is not an output. For example, you might use a pager to display the output of a cell magic. You'll generally have both a `Pagers` component and an `Outputs` component as part of your notebook cell so that you can display both pagers and outputs.

```jsx static
import { Pagers } from "@nteract/presentational-components"
```

Similar to other components, the `Pagers`  component provides a `hidden` flag that determines whether or not the contents of the component should be rendered. You can try it out below by toggling the value of the `hidden` prop in the code from `false` to `true`.

```
<Pagers hidden={false}>
This is a pager.
</Pagers>
```

Since `Pagers` are displayed alongside `Outputs`, you'll notice that the background color of the `Pagers` component is slightly different to distinguish between the two.
