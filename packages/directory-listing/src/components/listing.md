```jsx static
import {
  Entry,
  Listing,
  Icon,
  Name,
  LastSaved
} from "@nteract/directory-listing";
```

This component is used to create a directory listing. It is meant to be the parent to the Entry component. It will render a styled table of directory entries.

```jsx
<Listing>
  <Entry>
    <Icon fileType="notebook" />
    <Name>
      <a href="#listing">GANS-for-days.ipynb</a>
    </Name>
    <LastSaved lastModified="2018-06-27T16:21:25.354Z" />
  </Entry>

  <Entry>
    <Icon fileType="directory" />
    <Name>
      <a href="#listing">home</a>
    </Name>
    <LastSaved lastModified="2018-03-27T16:21:25.354Z" />
  </Entry>

  <Entry>
    <Icon fileType="file" />
    <Name>
      <a href="#listing">component.js</a>
    </Name>
    <LastSaved lastModified={new Date("2018-05-27T16:21:25.354Z")} />
  </Entry>
</Listing>
```
