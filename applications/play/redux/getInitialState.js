const getInitialState = () => ({
  ui: {
    repo: "binder-examples/jupyter-stacks",
    gitref: "master",
    source: `from vdom import h1, p, img, div, b, span
div(
    h1('Welcome to play.nteract.io'),
    p('Run Python code via Binder & Jupyter'),
    img(src="https://bit.ly/storybot-vdom"),
    p('Change the code, click ',
        span("▶ Run", style=dict(
            color="white",
            backgroundColor="black",
            padding="10px"
        )),
      ' Up above'
    )
)`,
    showPanel: true,
    currentServerId: "",
    currentKernelName: "",
    platform: ""
  },
  entities: {
    serversById: {}
  }
});

export default getInitialState;
