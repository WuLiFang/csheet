// https://www.purgecss.com/configuration
const purgecss = require('@fullhuman/postcss-purgecss')({
  content: [
    'src/**/*.{vue,ts}',
    'node_modules/vue-awesome/components/Icon.vue',
  ],
  defaultExtractor: content => content.match(/[\w-/:]+/g) || [],
});
const cssnano = require('cssnano')({
  preset: 'default',
});

module.exports = {
  plugins: [
    require('tailwindcss'),
    ...(process.env.NODE_ENV === 'production' ? [purgecss, cssnano] : []),
    require('autoprefixer'),
  ],
};
