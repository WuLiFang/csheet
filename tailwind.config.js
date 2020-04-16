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
      screens: {
        '2xl': '1440px',
      },
      minHeight: {
        '16': '4rem',
        '32': '8rem',
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
  },
  plugins: [require('@tailwindcss/custom-forms')],
};
