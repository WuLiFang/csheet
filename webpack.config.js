const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require('webpack');

module.exports = {
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
        exclude: /node_modules/,
        options: {
          appendTsSuffixTo: [/\.vue$/],
        },
      },
      {
        test: /\.vue$/,
        use: 'vue-loader',
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /\.pug$/,
        loader: 'pug-plain-loader'
      }
    ],
  },
  resolve: {
    extensions: ['.json', '.js', '.jsx', '.css', '.ts', '.sass', '.vue'],
    alias: {
      'jquery': require.resolve('jquery'),
      'vue$': 'vue/dist/vue.esm.js',
    }
  },
  devtool: 'source-map',
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css"
    }),
  ],
  devServer: {
    contentBase: path.join(__dirname, 'tests/pages'),
    proxy: {
      '/api': 'http://localhost:5001',
      '/videos': 'http://localhost:5001'
    },
    publicPath: '/static/dist',
  }
};