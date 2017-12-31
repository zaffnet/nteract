const fs = require("fs-extra");
const path = require("path");

const modulesToCopy = ["mathjax-electron"];

modulesToCopy.forEach(name => {
  const dirname = path.dirname(require.resolve(name));
  fs.copySync(dirname, `static/${name}`);
});
