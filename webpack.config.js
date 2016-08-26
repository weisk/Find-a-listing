var webpack = require('webpack');
var fs = require('fs');
var path = require('path');
var cssnext = require('postcss-cssnext');
var inlineImage = require('postcss-inline-image');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    context: __dirname,
    devtool: 'source-map',
    entry: {
        app: './assets/js/app.js',
        vendor: ['react', 'react-dom', 'modernizr', 'mapbox-gl', '@turf/turf']
    },
    output: {
        path: 'bin',
        filename: 'js/[name].[chunkhash].js',
        chunkFilename: "js/[chunkhash].js"
    },
    module: {
        preLoaders: [
            {
                test: /\.scss$/,
                loader: 'scsslint'
            },
            {
                test: /\.js$/,
                exclude:  ['node_modules', 'bower_components', 'bin'],
                loader: 'eslint'
            },
        ],
        loaders: [
            {
                test: /\.(json|geojson)$/,
                loader: 'json-loader'
            },
            {
                test: /\.modernizrrc$/,
                loader: "modernizr"
            },
            {
                test: /mapbox-gl.+\.js$/,
                loader: 'transform/cacheable?brfs'
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel'
            },
            {
                test: /\.scss$/,
                exclude: /(node_modules|bower_components)/,
                loader: ExtractTextPlugin.extract(['css', 'postcss', 'sass'])
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract(['css', 'postcss'])
            },
            {
                test: /\.(jpeg|png|gif|svg)$/i,
                loaders: [
                    'file?hash=sha512&digest=hex&name=images/[hash].[ext]',
                    'image-webpack'
                ]
            }
        ],
        postLoaders: [
            {
                test: /\.scss$/,
                exclude: /(node_modules|bower_components)/,
                loader: '@domjtalbot/sassdoc-loader'
            },
            {
                loader: 'transform/cacheable?brfs'
            }
        ]
    },
    resolve: {
        extensions: ['', '.js', '.jsx', '.scss', '.sass', '.css'],
        modulesDirectories: ['', 'node_modules', './assets/js', './assets/js/components', './assets/scss', './assets/scss/components'],
        alias: {
            modernizr$: path.resolve(__dirname, ".modernizrrc"),
            'webworkify': 'webworkify-webpack',
        }
    },
    sassLoader: {
        includePaths: [
            __dirname,
            path.resolve(__dirname, 'node_modules'),
            path.resolve(__dirname, 'assets/scss'),
            path.resolve(__dirname, './assets/scss/components')
        ]
    },
    sassdoc: {
        entry: './assets/**/*.scss',
        config: '.sassdoc.yml'
    },
    documentation: {
        entry: './assets/js/**/*.*',
        github: true,
        format: 'html',
        output: './documentation/js'
    },
    eslint: {
            fix: true,
            failOnWarning: false,
            failOnError: false
    },
    postcss: function () {
        return [
            cssnext({
                browsers: ['last 2 versions', 'ie 9', 'ie 10', 'ie 11', '> 1%']
            }),
        ];
    },
    plugins: [
        new ExtractTextPlugin('css/[name].[chunkhash].css', {
            allChunks: false
        }),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production'),
                'BROWSER': JSON.stringify('true'),
            },
        }),
        new webpack.optimize.CommonsChunkPlugin({
            names: ["vendor", "manifest"]
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            comments: false,
        }),
        new webpack.optimize.DedupePlugin(),
        new CleanWebpackPlugin(['./bin/js', './bin/css/', './bin/webpack.json'], {
              root: __dirname,
        }),
        new webpack.optimize.OccurrenceOrderPlugin(true),
        function() {
            this.plugin('done', function(stats) {
                fs.writeFileSync('./bin/webpack.json', JSON.stringify(stats.toJson()));
            });
        }
    ]
};
