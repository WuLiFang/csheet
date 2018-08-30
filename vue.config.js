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
      .entry('csheet')
      .add('./src/csheet.ts')
      .end()
      .entry('csheet_noscript')
      .add('./src/csheet.scss')
      .end();
    config.plugin('html').use(htmlPlugin, [{
      template: 'public/templates/index.html',
      filename: 'templates/index.html',
      chunks: ['chunk-vendors', 'index'],
    }, ]);
    config.plugin('html_csheet').use(htmlPlugin, [{
      template: 'public/templates/csheet.html',
      filename: 'templates/csheet.html',
      chunks: ['chunk-vendors', 'csheet'],
    }, ]);
    if (process.env.NODE_ENV === 'production') {
      config.plugin('asset').use(assetPlugin, [{
        path: 'dist'
      }]);
    }
  },
  devServer: {
    contentBase: path.join(__dirname, 'tests/pages'),
    proxy: 'http://localhost:5001',
  },
};