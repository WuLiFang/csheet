const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
let csheeetJS = {
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
    ],
  },
  resolve: {
    extensions: ['.json', '.js', '.jsx', '.css'],
  },
  devtool: 'source-map',
  devServer: {
    publicPath: path.join('/dist/'),
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css"
    })
  ]
};
module.exports = [csheeetJS]