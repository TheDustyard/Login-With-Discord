const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    entry: './scripts.tsx',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader, // creates style nodes from JS strings
                    "css-loader", // translates CSS into CommonJS
                    "sass-loader" // compiles Sass to CSS, using Node Sass by default
                ]
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "styles.css"
        })
    ],
    resolve: {
        extensions: ['.ts', '.tsx', '.scss', '.css', '.js']
    },
    output: {
        filename: 'scripts.js',
        path: __dirname
    },
    mode: 'production',
    watch: true,
};
