import { writeFileSync } from 'fs';
import { resolve, join } from 'path';

import CleanWebpackPlugin from 'clean-webpack-plugin';
import node_modules from 'webpack-node-externals';
import { optimize } from 'webpack';

export default {
    context: __dirname,
    entry: {
        server: './server.js',
    },
    output: {
        filename: '[name].js',
        path: join(__dirname, 'bin'),
    },
    target: 'node',
    node: {
            __filename: false,
            __dirname: true,
    },
    resolve: {
        alias: {
            'webpackjson': '/bin/webpack.json',
        },
    },
    externals: [
        node_modules(),
        {
            'webpackjson': 'require("./webpack.json")',
        },
    ],
    module: {
        preLoaders: [
            {
                test: /\.js$/,
                exclude:  ['node_modules', 'bin'],
                loader: 'eslint',
            },
        ],
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel',
            },
        ]
    },
    eslint: {
        fix: true,
        failOnError: false,
        failOnWarning: false,
    },
    plugins: [
        new CleanWebpackPlugin([
            'bin/webpack.server.json',
            'bin/server.js',
        ], {
              root: __dirname,
        }),
        new optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
            },
            comments: false,
        }),
        new optimize.OccurrenceOrderPlugin(),
        function() {
            this.plugin('done', stats => {
                const filePath = resolve(__dirname, 'bin/webpack.server.json');
                const data = JSON.stringify(stats.toJson());
                writeFileSync(filePath, data);
            });
        },
    ],
}
