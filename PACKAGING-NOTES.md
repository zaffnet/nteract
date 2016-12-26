


# Environment for Linux .deb packagin

This section contains notes made during the initial setup of the `.deb` packaging.

apt-get packages:

    sudo apt-get install npm nodejs
    # some packages that reduced build warnings
    sudo apt-get install libcairo2-dev libjpeg-dev libgif-dev
    # these are from some electron-build documentation
    sudo apt-get install --no-install-recommends -y icnsutils graphicsmagick xz-utils



run `npm run dist` in the root of the repository. This will create package such as `dist/nteract_0.0.15_amd64.deb`

install the debian package using `dpkg` or by double-clicking on the file, eg:

```
sudo dpkg -i dist/nteract_0.0.15_amd64.deb
```

that's it. Nteract can be launched from the command line as `nteract` or via a graphical launher.
The mime-type `application/x-ipynb+json` is used to identify files that can be opened with nteract.


## Contents of the .deb

Intalling the package will modify the following directories on the system:

- `/opt/interact`
    - most of the package's resources will be here
    - Ubuntu would like this to be in `/usr/share/nteract` (`lintian` linter will complain)
- `/usr/share/applications`
    - `nteract.desktop` is added here. This files creates the graphical launcher
- `/usr/share/doc/nteract/`
    - `changelog.gz` a gzipped version of an auto-generated changelog (based on what?) **TODO** figure out how to control generation of this file
- `/usr/share/icons/hicolor/<size>/apps/`
    a number of different sized logos (`nteract.png`). Based on `build/icon.incs` ?

## Debugging the debian archive


`.deb` files are *ar* archives. To see the contents of the package, run:

```
ar xv nteract_0.0.15_amd64.deb
```
This will create two arcives, `data.tar.xz`, and `control.tar.gz`. The data archive specifies what files will be install where. The control archive contains package metadata that is used by package managers such as `dpkg` and `apt-get`.

```
tar -xf data.tar.gz
tar -xf control.tar.gz
```

### Linting .deb files

To check .deb files for errors, use eg. `lintian`:

```
lintian nteract_0.0.15_amd64.deb
```
