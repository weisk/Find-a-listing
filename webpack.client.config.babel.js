import fs, { writeFileSync, readFileSync } from 'fs';
import { resolve, join } from 'path';

import CleanWebpackPlugin from 'clean-webpack-plugin';
import cssnext from 'postcss-cssnext';
import DashboardPlugin from 'webpack-dashboard/plugin';
import ExtractTextPlugin, { extract } from 'extract-text-webpack-plugin';
import webpack, { optimize, DefinePlugin, LoaderOptionsPlugin } from 'webpack';
import ManifestPlugin from 'webpack-manifest-plugin';
import ChunkManifestPlugin from 'chunk-manifest-webpack-plugin';
import SplitByPath from 'webpack-split-by-path';
import WebpackMd5Hash from 'webpack-md5-hash';

import './models/env';

const NODE_ENV = process.env.NODE_ENV;

const babelrcJson = JSON.parse(readFileSync('.babelrc'));
const babelrc = {
    ...babelrcJson,
    babelrc: false,
};
babelrc.presets.forEach((preset, index) => {
    if (preset[0] === 'es2015') {
        babelrc.presets[index][1].modules = false;
        return;
    }
});

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
    sassLoader: {
        outputStyle: 'expanded',
        sourceMapEmbed: true,
    },
    plugins: [
        new ExtractTextPlugin({
            filename: '[name].css',
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
        new ExtractTextPlugin({
            filename: '[name].[chunkhash].css',
            allChunks: false,
        }),
        new ManifestPlugin({
            fileName: 'manifest.json',
        }),
        new optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
            },
            comments: false,
        }),
        new optimize.DedupePlugin(),
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
                    query: babelrc,
                },
                {
                    test: /\.scss$/,
                    exclude: ['node_modules'],
                    loader: extract([
                        'css?-minimize',
                        'postcss',
                        'sass',
                    ]),
                },
                /*{
                    test: /\.css$/,
                    loader: ExtractTextPlugin.extract([
                        'css?-minimize',
                        'postcss',
                    ]),
                },*/
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
            resolve(__dirname, 'node_modules'),
            resolve(__dirname, 'assets/scss'),
            resolve(__dirname, 'assets/scss/components'),
        ],
    },
    sassdoc: {
        entry: join(__dirname, 'assets/**/*.scss'),
        config: '.sassdoc.yml'
    },
    documentation: {
            entry: join(__dirname, 'assets/js/**/*.*'),
            github: true,
            format: 'html',
            output: join(__dirname, 'documentation/js'),
    },
    eslint: {
            fix: true,
            failOnError: false,
            failOnWarning: false,
    },
    css: {

    },
    postcss: () => [
        cssnext({
            browsers: [
                'last 2 versions',
                'ie 9',
                'ie 10',
                'ie 11',
                '> 1%',
            ],
        }),
    ],
    plugins: [
        new SplitByPath ([
            {
                    name: 'vendor',
                    path: join(__dirname, 'node_modules'),
            },
        ], {
            manifest: 'common',
        }),
        new DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify(NODE_ENV),
                'mapboxKey': JSON.stringify(process.env.mapboxKey),
            },
        }),
        new LoaderOptionsPlugin({
            minimize: true,
            debug: false,
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
const webpackConfig = {
    ...sharedConfig,
    ...envConfig,
};
webpackConfig.plugins = [
    ...sharedConfig.plugins,
    ...envConfig.plugins,
];
webpackConfig.sassLoader = {
    ...sharedConfig.sassLoader,
    ...envConfig.sassLoader,
};

export { webpackConfig as default }
