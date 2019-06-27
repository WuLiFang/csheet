const path = require('path');
const assetPlugin = require('assets-webpack-plugin');
const htmlPlugin = require('html-webpack-plugin');
module.exports = {
  assetsDir: 'static',
  pages: {
    index: {
      entry: 'src/index.ts',
      template: 'public/templates/index.html',
      filename: 'templates/index.html',
    },
    main: {
      entry: 'src/main.ts',
      template: 'public/templates/main.html',
      filename: 'templates/main.html',
    },
  },
  chainWebpack: config => {
    config.resolve.alias.set('@', path.resolve('src'));
    config
      .entry('main_noscript')
      .add(path.resolve('src/main.scss'))
      .end();
    config.plugin('define').tap(args => {
      args[0].VERSION = JSON.stringify(require('./package.json').version);
      return args;
    });
    if (process.env.NODE_ENV === 'production') {
      config.plugin('asset').use(assetPlugin, [
        {
          path: path.resolve('dist'),
        },
      ]);
    }
  },
  lintOnSave: process.env.NODE_ENV !== 'production',
  devServer: {
    contentBase: path.join(__dirname, '../server/tests/pages'),
    proxy: 'http://localhost:5001',
  },
};
