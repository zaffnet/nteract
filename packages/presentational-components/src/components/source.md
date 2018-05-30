Used typically for notebook cell input.

```
<Source />
```

#### Default Behavior

If the child of this component is a *string*, then syntax highlight and make
non-editable.

If the child is any other type, then render and make editable.

#### Examples of Common Uses

Child is a *string* and using *language* prop for syntax highlighting

```
<Source language="python">{`
  import python

  print("Hello nteract.")
`}</ Source>
```

Child is a textarea. Rendered and editable.

```
<Source>
  <textarea>{`
  import python

  print("Hello nteract.")
  `}</ textarea>
</ Source>
```