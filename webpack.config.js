const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'development',
  entry: {
    csheet: path.join(__dirname, 'src', 'csheet.ts'),
    // csheet_css: path.join(__dirname, 'src', 'csheet.sass'),
    index: path.join(__dirname, 'src', 'index.ts'),
  },
  output: {
    filename: '[name].bundle.js',
    chunkFilename: '[id].js',
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
      oneOf: [{
        resourceQuery: /external/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader'],
      },
      ],
    },
    {
      test: /\.css$/,
      oneOf: [{
        resourceQuery: /external/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      ],
    },
    {
      test: /\.pug$/,
      loader: 'pug-plain-loader',
    },
    {
      test: new RegExp('\\.(png|jpg|jpeg|gif|eot|ttf' +
        '|woff|woff2|svg|svgz)(\\?.+)?$'),
      use: [{
        loader: 'url-loader',
        options: {
          limit: 10000,
          publicPath: '/static/dist',
        },
      }],
    },

    ],
  },
  resolve: {
    extensions: ['.json', '.js', '.jsx', '.css', '.ts', '.sass', '.vue'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
    },
  },
  devtool: 'source-map',
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV':
        JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
  ],
  devServer: {
    contentBase: path.join(__dirname, 'tests/pages'),
    proxy: {
      '/api': 'http://localhost:5001',
      '/videos': 'http://localhost:5001',
    },
    publicPath: '/static/dist',
  },
};
