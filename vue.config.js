const path = require('path');
const assetPlugin = require('assets-webpack-plugin');
const htmlPlugin = require('html-webpack-plugin');
module.exports = {
    assetsDir: 'static',
    chainWebpack: (config) => {
        config
            .entryPoints.clear().end()
            .entry('csheet').add('./src/csheet.ts').end()
            .entry('csheet_noscript').add('./src/csheet.scss').end()
            .entry('index').add('./src/index.ts').end();
        config.plugin('html')
            .use(htmlPlugin,
                [{
                    template: 'public/templates/csheet.html',
                    filename: 'templates/csheet.html',
                    chunks: ['csheet', 'vendors~csheet'],
                }]);
        config.plugin('html_index')
            .use(htmlPlugin,
                [{
                    template: 'public/templates/index.html',
                    filename: 'templates/index.html',
                    chunks: ['index', 'vendors~index'],
                    inject: 'head',
                }]);

        if (process.env.NODE_ENV === 'production') {
            config.plugin('asset')
                .use(assetPlugin, [{path: 'dist'}]);
        }

        config
            .devServer
            .publicPath('static/');
    },
    devServer: {
        contentBase: path.join(__dirname, 'tests/pages'),
        proxy: 'http://localhost:5001',
    },
};
