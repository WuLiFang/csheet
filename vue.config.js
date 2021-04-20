const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {
  posix: { relative },
} = require('path');

function useRelativeAssetsPath(templateParameters) {
  return (compilation, assets, pluginOptions) => {
    const ret = templateParameters(compilation, assets, pluginOptions);
    const files = ret.htmlWebpackPlugin.files;
    for (const i of Object.values(files.chunks)) {
      i.entry = relative(files.publicPath, i.entry);
      i.css = i.css.map((j) => relative(files.publicPath, j));
    }
    files.js = files.js.map((i) => relative(files.publicPath, i));
    files.css = files.css.map((i) => relative(files.publicPath, i));
    files.publicPath = '';
    return ret;
  };
}

/** @type {import('@vue/cli-service').ProjectOptions & { devServer: import('webpack-dev-server').Configuration}} */
module.exports = {
  assetsDir: 'static',

  pages: {
    index: {
      entry: 'src/main.ts',
    },
    'index.static': {
      entry: 'src/main.static.ts',
      template: 'public/index.static.html',
    },
  },

  chainWebpack: (config) => {
    // sass loader defaults to 'compressed' output style, which removes comment for purgecss
    // https://github.com/webpack-contrib/sass-loader/issues/763
    const types = ['vue-modules', 'vue', 'normal-modules', 'normal'];
    types.forEach((type) =>
      config.module
        .rule('scss')
        .oneOf(type)
        .use('sass-loader')
        .merge({
          options: {
            sassOptions: {
              outputStyle: 'expanded',
            },
          },
        })
    );
    config.plugin('moment').use(MomentLocalesPlugin, [
      {
        localesToKeep: ['zh-cn'],
      },
    ]);
    config.plugin('define').tap((args) => {
      args[0].RELEASE = JSON.stringify(process.env.CSHEET_RELEASE);
      return args;
    });
    config.plugin('html-index.static').tap((args) => {
      args[0].templateParameters = useRelativeAssetsPath(
        args[0].templateParameters
      );
      return args;
    });
    config.plugin('asset-list.static').use(
      new HtmlWebpackPlugin({
        templateContent: (v) => {
          const assets = [
            ...v.webpack.entrypoints['index.static'].assets,
            ...v.webpack.assets
              .filter((i) => {
                if (i.name.endsWith('.html')) {
                  return false;
                }
                return i.chunks.length === 0;
              })
              .map((i) => i.name),
          ].filter((i) => {
            // XXX: missing css source map for unknown reason
            if (i.endsWith('.css.map')) {
              return false;
            }

            // exclude source map to reduce bundle size
            if (i.endsWith('.js.map')) {
              return false;
            }
            return true;
          });
          return assets.join('\n') + '\n';
        },
        inject: false,
        minify: false,
        filename: 'assets.static.txt',
      })
    );

    config.resolve.alias.set('lodash', 'lodash-es');

    config.module
      .rule('gql')
      .test(/\.(gql|graphql)$/)
      .use('cache-loader')
      .loader('cache-loader')
      .end()
      .use('thread-loader')
      .loader('thread-loader')
      .end()
      .use('gql-loader')
      .loader('graphql-tag/loader')
      .end();
  },
  transpileDependencies: ['strip-ansi', 'ansi-regex'],

  lintOnSave: process.env.NODE_ENV !== 'production',

  devServer: {
    proxy: {
      '/': {
        target: 'http://localhost:8000',
        ws: true,
      },
    },
  },

  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'zh',
      localeDir: 'locales',
      enableInSFC: false,
    },
  },
};
