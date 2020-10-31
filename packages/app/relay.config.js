const packages = ['app', 'ui'];

module.exports = {
  src: '../.',
  schema: '../schema/schema.graphql',
  language: 'typescript',
  include: [...packages.map((pkg) => `./${pkg}/src/**`)],
};
