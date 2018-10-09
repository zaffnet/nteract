```jsx static
import { HeaderEditor } from "@nteract/presentational-components";
```

HeaderEditor component for editing your header

### Editable Fixed Header

```js
<HeaderEditor
  editable={true}
  headerData={{
    authors: ["Elijah Meeks", "Kyle Kelley"],
    description: "A cool notebook for kids and animals!",
    title: "Notebook with Header",
    tags: ["amazing", "kids", "animals"]
  }}
/>
```

```js
class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      authors: ["Elijah Meeks", "Kyle Kelley"],
      description: "A cool notebook for kids and animals!",
      title: "Notebook with Header",
      tags: ["amazing", "kids", "animals"]
    };
  }

  render() {
    return (
      <HeaderEditor
        editable={true}
        headerData={this.state}
        onChange={header => {
          console.log("header", header);
          this.setState(header);
        }}
      />
    );
  }
}

<Editor />;
```

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

### Defaults

Renders a default view that states intent for users

```
<HeaderEditor />
```
