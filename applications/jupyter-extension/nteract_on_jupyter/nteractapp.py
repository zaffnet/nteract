from notebook.notebookapp import NotebookApp, flags
from traitlets import Unicode

from . import EXT_NAME
from .config import NteractConfig
from .extension import load_jupyter_server_extension

webpack_hot = {"address": 'http://localhost:8080/',
               "command":"`lerna run hot --scope nteract-on-jupyter --stream`"}
nteract_flags = dict(flags)
nteract_flags['dev'] = (
    {'NteractConfig': {'asset_url': webpack_hot['address']},
    },
    "\n".join([
        "Start nteract in dev mode, serving assets built from your source code.",
        "This is a hot reloading server that watches for changes to your source,",
        "rebuilds the js files, and serves the new assets on:",
        "    {address}",
        "To access this server run:",
        "    {command}"]).format(**webpack_hot)
)

class NteractApp(NotebookApp):
    """Application for runing nteract on a jupyter notebook server.

    """
    default_url = Unicode('/nteract/edit',
                          help="nteract's default starting location")

    classes = [*NotebookApp.classes, NteractConfig]
    flags = nteract_flags

    def init_server_extensions(self):
        super(NteractApp, self).init_server_extensions()
        msg = 'NteractApp server extension not enabled, manually loading...'
        if not self.nbserver_extensions.get(EXT_NAME, False):
            self.log.warn(msg)
            load_jupyter_server_extension(self)

main = launch_new_instance = NteractApp.launch_instance

if __name__ == '__main__':
    main()
