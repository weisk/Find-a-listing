import { writeFileSync } from 'fs';
import { resolve, join } from 'path';

import ExtractTextPlugin, { extract } from 'extract-text-webpack-plugin';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import node_modules from 'webpack-node-externals';
import { optimize, DefinePlugin } from 'webpack';

import './models/env';

const NODE_ENV = process.env.NODE_ENV;

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
        extensions: [
            '',
            '.js',
            '.scss',
            '.sass',
            '.css',
        ],
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
            {
                test: /\.scss$/,
                exclude: ['node_modules'],
                loader: extract([
                    'css?-minimize',
                    'sass',
                ]),
            },
        ]
    },
    eslint: {
        fix: true,
        failOnError: false,
        failOnWarning: false,
    },
    sassLoader: {
        includePaths: [
            __dirname,
            resolve(__dirname, 'node_modules'),
            resolve(__dirname, 'assets/scss'),
            resolve(__dirname, 'assets/scss/components'),
        ],
    },
    plugins: [
        new CleanWebpackPlugin([
            'bin/webpack.server.json',
            'bin/server.js',
        ], {
              root: __dirname,
        }),
        new ExtractTextPlugin({
            filename: '[name].css',
        }),
        new optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
            },
            comments: false,
        }),
        new optimize.DedupePlugin(),
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
