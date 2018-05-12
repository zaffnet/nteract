from notebook.notebookapp import NotebookApp, flags
from traitlets import Unicode

from . import EXT_NAME
from .config import NteractConfig
from .extension import load_jupyter_server_extension

nteract_flags = dict(flags)
nteract_flags['dev'] = (
    {'NteractConfig': {'asset_url':'http://localhost:8080/'}},
    "Start nteract in dev mode, running off your source code, with hot reloads."
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
