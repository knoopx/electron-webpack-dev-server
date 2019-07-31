const options = {
  "main-config": {
    type: 'string',
    default: "webpack.main.config.js",
    describe: 'Main process webpack configuration file.',
  },
  "renderer-config": {
    type: 'string',
    default: "webpack.renderer.config.js",
    describe: 'Renderer process webpack configuration file.',
  },
};

module.exports = options;
