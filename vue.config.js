const path = require('path');
const assetPlugin = require('assets-webpack-plugin');
const htmlPlugin = require('html-webpack-plugin');
module.exports = {
  assetsDir: 'static',
  pages: {
    index: {
      entry: 'frontend/index.ts',
      template: 'public/templates/index.html',
      filename: 'templates/index.html',
    },
    main: {
      entry: 'frontend/main.ts',
      template: 'public/templates/main.html',
      filename: 'templates/main.html',
    },
  },
  chainWebpack: config => {
    config.resolve.alias.set('@', path.resolve('frontend'));
    config
      .entry('main_noscript')
      .add(path.resolve('frontend/main.scss'))
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
  devServer: {
    contentBase: path.join(__dirname, 'tests/pages'),
    proxy: 'http://localhost:5001',
  },
};
