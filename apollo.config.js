const path = require('path');

module.exports = {
  client: {
    service: {
      localSchemaFile: path.resolve(__dirname, 'src', 'graphql', 'schema.json'),
    },
    includes: ['src/graphql/**/*.gql'],
  },
};
