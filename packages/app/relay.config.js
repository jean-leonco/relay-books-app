let workspaces = ['app', 'ui']; // Workspaces that should be bundled/watched by webpack.
workspaces = workspaces.map((ws) => `./${ws}/**`); // Transform workspace name into absolute path.

module.exports = {
  schema: '../schema/schema.graphql', // Path to schema.graphql or schema.json.
  src: '../.', // Root directory of application code.
  include: workspaces, // Directories to include under src.
  language: 'typescript', // The name of the language plugin used for input files and artifacts.
};
