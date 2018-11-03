The `ExecuteResult` component is a container component that is used to render output data from the kernel. Similar to the `DisplayData` component, the `ExecuteResult` component acts as a simple switch over its children and correctly associates the media type of the data with the media type that a component supports.

Why do so many component employ this pattern? It's in the interest of readability. Although each component executes the same logic under the hood, the separation of components by output types allows you to write meaningful JSX from these React components.

```jsx
const Plain = props => <pre>{props.data}</pre>;
Plain.defaultProps = {
  mediaType: "text/plain"
};

<ExecuteResult data={{ "text/plain": "The answer to everything is 42." }}>
  <Plain />
</ExecuteResult>;
```
