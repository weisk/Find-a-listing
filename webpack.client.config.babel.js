import fs, { writeFileSync } from 'fs';
import path, { resolve, join } from 'path';

import CleanWebpackPlugin from 'clean-webpack-plugin';
import cssnext from 'postcss-cssnext';
import DashboardPlugin from 'webpack-dashboard/plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import PathChunkPlugin from 'path-chunk-webpack-plugin';
import webpack, { optimize, DefinePlugin } from 'webpack';
import ManifestPlugin from 'webpack-manifest-plugin';
import ChunkManifestPlugin from 'chunk-manifest-webpack-plugin';
import WebpackMd5Hash from 'webpack-md5-hash';

import './models/env';

const NODE_ENV = process.env.NODE_ENV;

console.log(`Webpack env: ${NODE_ENV}`);

/**
 * Webpack settings required for development env.
 * @type {Object}
 */
const devConfig = {
    devtool: 'source-map',
    devServer: {
        'content-base': 'public/',
        inline: true,
        'history-api-fallback': true,
        https: true,
        host: '0.0.0.0',
        port: 5001,
        compress: true,
        colors: true,
    },
    output: {
        filename: '[name].js',
        chunkFilename: '[name].js',
        path: join(__dirname, 'public/assets/'),
        publicPath: 'https://localhost:5001/assets/',
    },
    plugins: [
        new ExtractTextPlugin('css/[name].css', {
            allChunks: false
        }),
        new DashboardPlugin(),
    ],
};

/**
 * Webpack settings required for Production Env
 * @type {Object}
 */
const prodConfig = {
    output: {
        filename: '[name].[hash].js',
        chunkFilename: '[name].[chunkhash].js',
        path: join(__dirname, 'public/assets/[hash]'),
        publicPath: '/assets/[hash]/',
    },
    plugins: [
        new ExtractTextPlugin('css/[name].[chunkhash].css', {
            allChunks: false
        }),
        new ManifestPlugin({
            fileName: 'manifest.json',
        }),
    ],
};

/**
 * Webpack settings used for all env.
 * @type {Object}
 */
const sharedConfig = {
    context: __dirname,
    entry: {
        app: './modules/index.js',
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
                modernizr$: resolve(__dirname, '.modernizrrc'),
                'webworkify': 'webworkify-webpack',
            },
    },
    module: {
            preLoaders: [
                {
                    test: /\.scss$/,
                    loader: 'scsslint',
                },
                {
                    test: /\.js$/,
                    exclude:  ['node_modules', 'bin'],
                    loader: 'eslint',
                },
            ],
            loaders: [
                {
                    test: /\.(json|geojson)$/,
                    loader: 'json',
                },
                {
                    test: /\.modernizrrc$/,
                    loader: 'modernizr',
                },
                {
                    test: /mapbox-gl.+\.js$/,
                    loader: 'transform?brfs',
                },
                {
                    test: /\.js$/,
                    exclude: ['node_modules'],
                    loader: 'babel',
                },
                {
                    test: /\.scss$/,
                    exclude: ['node_modules'],
                    loader: ExtractTextPlugin.extract([
                        'css',
                        'postcss',
                        'sass',
                    ]),
                },
                {
                    test: /\.css$/,
                    loader: ExtractTextPlugin.extract([
                        'css',
                        'postcss',
                    ]),
                },
            ],
            postLoaders: [
                {
                    test: /\.scss$/,
                    exclude: ['node_modules'],
                    loader: '@domjtalbot/sassdoc-loader',
                },
            ],
    },
    sassLoader: {
            includePaths: [
                    __dirname,
                    path.resolve(__dirname, 'node_modules'),
                    path.resolve(__dirname, 'assets/scss'),
                    path.resolve(__dirname, 'assets/scss/components'),
            ],
    },
    sassdoc: {
        entry: path.join(__dirname, 'assets/**/*.scss'),
        config: '.sassdoc.yml'
    },
    documentation: {
            entry: path.join(__dirname, 'assets/js/**/*.*'),
            github: true,
            format: 'html',
            output: path.join(__dirname, 'documentation/js'),
    },
    eslint: {
            fix: true,
            failOnError: false,
            failOnWarning: false,
    },
    postcss: () => [
        cssnext({
            browsers: [
                'last 2 versions',
                'ie 9',
                'ie 10',
                'ie 11',
                '> 1%'
            ],
        }),
    ],
    plugins: [
        new PathChunkPlugin({
            name: 'vendor',
            test: 'node_modules/',
        }),
        new DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify(NODE_ENV),
            },
        }),
        new optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
            },
            comments: false,
        }),
        new CleanWebpackPlugin([
            'bin/webpack.json',
            'public/assets/',
        ], {
              root: __dirname,
        }),
        new WebpackMd5Hash(),
        new optimize.OccurrenceOrderPlugin(),
        function() {
            this.plugin('done', stats => {
                const filePath = resolve(__dirname, 'bin/webpack.json');
                const data = JSON.stringify(stats.toJson());
                writeFileSync(filePath, data);
            });
        },
    ],
};

let envConfig;
switch (NODE_ENV) {
    case 'local':
    case 'development':
        envConfig = devConfig;
        break;
    case 'production':
    default:
        envConfig = prodConfig;
}
const webpackConfig = Object.assign({}, sharedConfig, envConfig);
webpackConfig.plugins = [...sharedConfig.plugins, ...envConfig.plugins];

export { webpackConfig as default }
