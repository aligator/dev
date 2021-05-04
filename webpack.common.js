/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
    entry: './src/index.tsx',
    mode: 'development',
    devtool: 'source-map',
    optimization: {
        usedExports: true
    },
    output: {
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                    exclude: /node_modules/,
                    use: {
                    loader: 'ts-loader',
                    options: {
                        // disable type checker - we will use it in fork plugin
                        transpileOnly: true
                    }
                }
            },
            { 
                test: /\.(png|jpg|gif|svg|ttf|woff|woff2)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[path][name].[ext]',
                            context: path.resolve(__dirname, "src/"),
                            outputPath: 'dist/',
                            useRelativePaths: true
                        }
                    }
                ] 
            },
            {
                test: /\.(scss|css)$/,
                use: [
                    process.env.NODE_ENV !== 'production'
                        ? 'style-loader'
                        : MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true,
                        },
                    }
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    plugins: [
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: '[name].[contenthash].css',
            chunkFilename: '[id].css'
        }),
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './src/index.html'
        }),
        new ForkTsCheckerWebpackPlugin(),
        new CopyPlugin({
            patterns: [{ from: 'src/assets', to: '' }]
        }),
        new ESLintPlugin({
            extensions: ['.tsx', '.ts', '.js'],
            exclude: 'node_modules'
        })
    ]
};