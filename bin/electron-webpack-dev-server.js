#!/usr/bin/env node

const path = require("path")
const { spawn } = require("child_process")

const webpack = require("webpack")
const WebpackDevServer = require("webpack-dev-server")
const yargs = require("yargs")
const createDomain = require("webpack-dev-server/lib/utils/createDomain")
const getVersions = require("webpack-dev-server/lib/utils/getVersions")

const LOCAL_BIN_PATH = path.join(process.cwd(), "node_modules", ".bin")

function startDevServer(options) {
  const devServerOptions = {
    publicPath: "/",
    hot: true,
    historyApiFallback: true,
    overlay: true,
    inline: true,
  }

  const rendererConfig = require(path.resolve(
    process.cwd(),
    options.rendererConfig,
  ))
  const rendererCompiler = webpack(rendererConfig)
  const devServer = new WebpackDevServer(rendererCompiler, devServerOptions)

  devServer.listen(null, "localhost", () => {
    const url = createDomain(devServer.options, devServer.listeningApp)
    const mainConfig = require(path.resolve(process.cwd(), options.mainConfig))
    const mainCompiler = webpack(mainConfig)

    mainCompiler.hooks.entryOption.call(
      mainCompiler.options.context,
      mainCompiler.options.entry,
    )

    const definePlugin = new webpack.DefinePlugin({
      __ELECTRON_WEBPACK_DEV_SERVER_URL__: JSON.stringify(url),
    })

    definePlugin.apply(mainCompiler)

    let child
    const watcher = mainCompiler.watch({}, (err, status) => {
      if (child) {
        child.kill()
      }

      const mainAssets = Object.keys(status.compilation.assets)

      if (mainAssets.length > 1) {
        console.error(
          "Multiple webpack entries found in the electron main process webpack config, please set only one.",
        )
        process.exit(1)
      }

      const mainOutputFile = path.join(mainCompiler.outputPath, mainAssets[0])
      child = spawn(path.join(LOCAL_BIN_PATH, "electron"), [mainOutputFile], { shell: process.platform == 'win32' })
      child.stdout.on("data", (data) => {
        console.log(data.toString())
      })
      child.stderr.on("data", (data) => {
        console.error(data.toString())
      })
      child.on("close", (code) => {
        devServer.close()
        watcher.close()
        process.exit(code)
      })
    })
  })
}

yargs.usage(`${getVersions()}\nUsage:  electron-webpack-server [Options]`)

yargs.version(getVersions())
yargs.options({
  "main-config": {
    type: "string",
    default: "webpack.main.config.js",
    describe: "Main process webpack configuration file.",
  },
  "renderer-config": {
    type: "string",
    default: "webpack.renderer.config.js",
    describe: "Renderer process webpack configuration file.",
  },
})

startDevServer(yargs.argv)
