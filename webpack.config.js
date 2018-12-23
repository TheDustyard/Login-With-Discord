const path = require("path");
const webpack = require('webpack');

module.exports = {
    entry: {
        "lwd": "./src/lwd.ts"
    },
    output: {
        filename: "[name].js",
        library: "LoginWithDiscord",
        libraryTarget: "commonjs",
        path: path.resolve(__dirname, "bin")
    },
    module: {
        rules: [
          {
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/
          }
        ]
      },
    resolve: {
        extensions: [".ts"]
    },
    mode: "production",
    devtool: 'inline-source-map',
    // watch: true
};
