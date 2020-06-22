/** @type {import('@vue/cli-service').ProjectOptions & { devServer: import('webpack-dev-server').Configuration}} */
module.exports = {
  assetsDir: 'static',

  pages: {
    index: {
      entry: 'src/main.ts',
    },
  },

  chainWebpack: config => {
    // sass loader defaults to 'compressed' output style, which removes comment for purgecss
    // https://github.com/webpack-contrib/sass-loader/issues/763
    const types = ['vue-modules', 'vue', 'normal-modules', 'normal'];
    types.forEach(type =>
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

    config.plugin('define').tap(args => {
      args[0].RELEASE = JSON.stringify(process.env.CSHEET_RELEASE);
      return args;
    });
  },
  transpileDependencies: ['strip-ansi', 'ansi-regex'],

  lintOnSave: process.env.NODE_ENV !== 'production',

  devServer: {
    proxy: {
      '/': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        headers: {
          Origin: 'http://localhost:8000',
        },
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
    apollo: {
      lintGQL: true,
    },
  },
};
