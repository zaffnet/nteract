```jsx static
import { HeaderEditor } from "@nteract/presentational-components";
```

HeaderEditor component for editing your header

### Basic Fixed Header

```js
<HeaderEditor
  editable={false}
  headerData={{
    authors: ["Elijah Meeks", "Kyle Kelley"],
    description: "A cool notebook for kids and animals!",
    title: "Notebook with Header",
    tags: ["amazing", "kids", "animals"]
  }}
/>
```

Can also be editable:

INSERT EDITABLE VERSION HERE

### Defaults

Renders a default view that states intent for users

```
<HeaderEditor />
```
