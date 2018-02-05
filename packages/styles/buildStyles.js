const config = require("./src/config.json");
const fs = require("fs");
const path = require("path");

const BUILD_DIR = path.join(__dirname, "build");
const CSS_PATH = path.join(BUILD_DIR, "styles.js");
const DECLARATIONS_PATH = path.join(BUILD_DIR, "declarations.json");
const VARIABLES_PATH = path.join(BUILD_DIR, "variables.json");

const declarations = {};

const toDash = str => str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
const makeName = name => {
  const dashName = toDash(name.replace(/--/g, "-").replace(/-$/, ""));
  return `--${config.prefix}-${dashName}`;
};

function makeDeclarationSet(groupKey, isAlias) {
  const modifiers = config.theme.modifiers[groupKey];
  if (isAlias) {
    Object.entries(config.theme.alias[groupKey]).forEach(([jsAlias, jsKey]) => {
      if (modifiers) {
        modifiers.order.forEach(modifierValue => {
          const variableName = makeName(
            `${groupKey}-${jsAlias}-${modifierValue}`
          );
          const baseName = makeName(`${groupKey}-${jsKey}-${modifierValue}`);
          if (!declarations[baseName]) {
            throw new Error(`Base variable ${baseName} not assigned.`);
          }
          declarations[variableName] = `var(${baseName})`;
        });
      } else {
        const variableName = makeName(`${groupKey}-${jsAlias}`);
        const baseName = makeName(`${groupKey}-${jsKey}`);
        if (!declarations[baseName]) {
          throw new Error(`Base variable ${baseName} not assigned.`);
        }
        declarations[variableName] = `var(${baseName})`;
      }
    });
  } else {
    Object.entries(config.theme.base[groupKey]).forEach(([jsKey, value]) => {
      if (modifiers) {
        const modifierObject =
          typeof value === "object" ? value : { [modifiers.default]: value };
        modifiers.order.forEach(modifierValue => {
          const variableName = makeName(
            `${groupKey}-${jsKey}-${modifierValue}`
          );
          const cssValue = modifierObject[modifierValue];
          if (typeof cssValue !== "undefined") {
            declarations[variableName] = cssValue;
          } else {
            const fallback = modifiers.values[modifierValue];
            if (fallback === null) {
              throw new Error(
                `Cannot resolve modifiers for "${groupKey}", "${jsKey}"`
              );
            }
            const baseName = makeName(`${groupKey}-${jsKey}-${fallback}`);
            declarations[variableName] = `var(${baseName})`;
          }
        });
      } else {
        if (typeof value === "object") {
          throw new Error(`Invalid modifier object in group ${groupKey}`);
        }
        declarations[makeName(`${groupKey}-${jsKey}`)] = value;
      }
    });
  }
}

Object.keys(config.theme.base).forEach(groupKey =>
  makeDeclarationSet(groupKey)
);
Object.keys(config.theme.alias).forEach(groupKey =>
  makeDeclarationSet(groupKey, true)
);

if (!fs.existsSync(BUILD_DIR)) {
  fs.mkdirSync(BUILD_DIR);
}

// Generate themeable css. Overwrite the whole file for the first write.
fs.writeFileSync(
  CSS_PATH,
  "// This file is auto-generated. See buildStyles.js for details.\n\n"
);
fs.appendFileSync(CSS_PATH, "module.exports = `\n:root {\n");
Object.entries(declarations).forEach(([cssProperty, cssValue]) => {
  fs.appendFileSync(CSS_PATH, `  ${cssProperty}: ${cssValue};\n`);
});
fs.appendFileSync(CSS_PATH, "}\n`;\n");

// Generate variable file for validation.
fs.writeFileSync(
  VARIABLES_PATH,
  JSON.stringify(Object.keys(declarations), null, "  ")
);

// Generate declarations json file.
fs.writeFileSync(
  DECLARATIONS_PATH,
  JSON.stringify(Object.entries(declarations), null, "  ")
);
