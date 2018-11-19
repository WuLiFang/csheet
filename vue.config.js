const path = require('path');
const assetPlugin = require('assets-webpack-plugin');
const htmlPlugin = require('html-webpack-plugin');
module.exports = {
  assetsDir: 'static',
  chainWebpack: config => {
    config.entryPoints
      .clear()
      .end()
      .entry('index')
      .add('./src/index.ts')
      .end()
      .entry('main')
      .add('./src/main.ts')
      .end()
      .entry('main_noscript')
      .add('./src/main.scss')
      .end();
    config.plugin('html').use(htmlPlugin, [
      {
        template: 'public/templates/index.html',
        filename: 'templates/index.html',
        chunks: ['chunk-vendors', 'index'],
      },
    ]);
    config.plugin('html_main').use(htmlPlugin, [
      {
        template: 'public/templates/main.html',
        filename: 'templates/main.html',
        chunks: ['chunk-vendors', 'main'],
      },
    ]);
    config.plugin('define').tap(args => {
      args[0].VERSION = JSON.stringify(require('./package.json').version);
      return args;
    });
    if (process.env.NODE_ENV === 'production') {
      config.plugin('asset').use(assetPlugin, [
        {
          path: 'dist',
        },
      ]);
    }
  },
  devServer: {
    contentBase: path.join(__dirname, 'tests/pages'),
    proxy: 'http://localhost:5001',
  },
};
