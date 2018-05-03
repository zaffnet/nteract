# nteract on jupyter

nteract as an extension to the jupyter notebook server

## Installation

```
pip install nteract_on_jupyter
jupyter serverextension enable nteract_on_jupyter
```

### Configuration

When you launch the jupyter notebook server, there is a new `NteractConfig` that allows setting:

* `ga_code` - Google Analytics code to track usage
* `asset_url` - Where to load nteract js from

Example:

```
jupyter notebook --NteractConfig.asset_url="http://localhost:8080/" --NteractConfig.ga_code="GA-SOME-NUMBERS"
```

## Development

All code snippets assume you're starting from the root of the nteract/nteract monorepo.

### 1. Install Monorepo (JS)

```
npm install
```

### 2. Install/enable jupyter-extension (Python)

Install the python package locally from here.

```
cd applications/jupyter-extension
pip install -e .
jupyter serverextension enable nteract_on_jupyter
```

### 3. Run notebook server (Python)

In one terminal, start up a notebook server.

```
cd applications/jupyter-extension
jupyter notebook
```

### 4. Run jupyter-extension (JS)

```
npm run app:jupyter-extension
```

This both runs a live reload webpack server and a jupyter notebook server. Once the jupyter server is up, it will load a page that isn't really ready until the initial webpack bundle is built. You'll need to reload the page after.
