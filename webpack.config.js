const path = require('path');

module.exports = {
    entry: './src/index.ts',
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
        extensions: ['.ts']
    },
    output: {
        filename: 'lwd.js',
        library: 'LoginWithDiscord',
        libraryTarget: 'var',
        path: path.resolve(__dirname, 'dist')
    },
    mode: 'production',
    watch: true
};
