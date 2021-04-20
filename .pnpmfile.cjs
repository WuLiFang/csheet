function readPackage(pkg, context) {
  // https://github.com/apollographql/subscriptions-transport-ws/issues/772
  if (pkg.name === 'subscriptions-transport-ws') {
    pkg.dependencies['@types/ws'] = '^5.1.2';
  }

  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  },
};
