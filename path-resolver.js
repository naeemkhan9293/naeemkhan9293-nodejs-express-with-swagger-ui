// This file is used to register path aliases for the compiled code
const tsConfigPaths = require("tsconfig-paths");

tsConfigPaths.register({
  baseUrl: ".",
  paths: {
    "#src/*": ["./dist/*"],
  },
});
