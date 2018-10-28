Markdown is a popular markup language for formatting text files. The `Media.Markdown` component allows you to render Markdown. The default media type used for the `Media.Markdown` component, and elsewhere on the web, is `text/markdown`. To render markdown, you'll need to pass the plain-text markup of your Markdown text to the `data` prop of the component like so.

```
<Markdown data={"Markdown is **Awesome!!!**"} />
```

This component renders Markdown that complies with the [Commonmark Markdown specification](https://commonmark.org/). `Media.Markdown` also allows you to render LaTeX equations within your Markdown as follows.

```
<Markdown data={`Math, like $C_{d}^{\prime} = \\frac{\alpha}{}$, is pretty cool.`}/>
```