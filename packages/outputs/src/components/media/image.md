Render an image media type. This is for output that is an image such as a matplotlib output chart.

```
const { matplotlibImage } = require("../../../sampleData/sampleImage");

<Image data={matplotlibImage} mediaType="image/png" />
```

You can change the size of the image by changing the height and width in metadata.

```
const { matplotlibImage } = require("../../../sampleData/sampleImage");

<Image data={matplotlibImage} mediaType="image/png" metadata={{ height: "200px", width: "800px"}} />
```
