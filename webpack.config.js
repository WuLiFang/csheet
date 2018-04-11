const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require('webpack');
let csheeetJS = {
  mode: "development",
  entry: {
    csheet: path.join(__dirname, 'src', 'csheet.ts'),
    // csheet_css: path.join(__dirname, 'src', 'csheet.sass'),
    index: path.join(__dirname, 'src', 'index.ts'),
  },
  output: {
    filename: '[name].bundle.js',
    chunkFilename: "[id].js",
    path: path.resolve(__dirname, 'lib', 'csheet', 'static', 'dist'),
  },
  module: {
    rules: [{
      test: /\.tsx?$/,
      loader: 'ts-loader',
      include: [
        path.resolve(__dirname, 'src'),
      ],
    },
    {
      test: /\.scss$/,
      use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
    },
    {
      test: /\.css$/,
      use: [MiniCssExtractPlugin.loader, 'css-loader']

    }
    ],
  },
  resolve: {
    extensions: ['.json', '.js', '.jsx', '.css', '.ts', '.sass'],
    alias: {
      'jquery': require.resolve('jquery')
    }
  },
  devtool: 'source-map',
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css"
    })
  ],
  devServer: {
    contentBase: path.join(__dirname, 'tests/pages'),
    proxy: {
      '/api': 'http://localhost:5001',
      '/images': 'http://localhost:5001',
    },
    publicPath: '/static/dist',
  },
};
module.exports = [csheeetJS]