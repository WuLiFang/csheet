module.exports = {
  important: '#h',
  theme: {
    extend: {
      colors: {
        status: {
          wait: '#00557f',
          check: '#dbdb02',
          retake: '#ff0000',
          approve: '#00ce00',
          close: '#000000',
        },
      },
      backgroundColor: theme => ({
        primary: theme('colors.gray.800'),
        secondary: theme('colors.black'),
      }),
      screens: {
        '2xl': '1440px',
      },
      minHeight: {
        '16': '4rem',
        '32': '8rem',
      },
      maxHeight: {
        '64': '16rem',
        '96': '24rem',
        '128': '32rem',
      },
      cursor: {
        'zoom-in': 'zoom-in',
        'zoom-out': 'zoom-out',
      },
    },
    customForms: theme => ({
      default: {
        'input, textarea, multiselect, select': {
          color: theme('colors.gray.200'),
          backgroundColor: theme('colors.gray.900'),
          borderColor: theme('colors.gray.700'),
        },
      },
    }),
  },
  variants: {
    textColor: ['responsive', 'hover', 'focus', 'disabled'],
    display: ['responsive', 'group-hover'],
    borderWidth: ['responsive', 'first', 'hover', 'focus'],
  },
  plugins: [require('@tailwindcss/custom-forms')],
  purge: {
    content: [
      'src/**/*.{vue,ts}',
      'node_modules/vue-awesome/components/Icon.vue',
    ],
  },
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
};
