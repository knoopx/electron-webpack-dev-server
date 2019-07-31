# Description

This is a lightweight alternative to electron-webpack.

Instead of providing a full set of automatic and conflicting configurations for webpack, this one just starts webpack-dev-server and webpack in watch mode.

# Install

```
yarn add --dev knoopx/electron-webpack-dev-server
```

# Usage

Just create a webpack config for your main and renderer processes:

```
# webpack.main.config.js
module.exports = {
  target: "electron-main",
  entry: {
    main: ["./src/main/index.js"]
  }
};
```

```
# webpack.renderer.config.js
module.exports = {
  target: "electron-renderer",
  entry: {
    renderer: [
      "./src/renderer/index.js"
    ]
  },
  ...
};
```

Then run:

```
yarn electron-webpack-dev-server
```
