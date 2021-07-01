const cluster = require('cluster');
const path = require('path');

const script = path.resolve('build', 'index.js');

const config = require('./webpack.config');

class ReloadServerPlugin {
  constructor() {
    this.done = null;
    this.workers = [];

    cluster.setupMaster({
      exec: path.resolve(process.cwd(), script),
    });

    cluster.on('online', (worker) => {
      this.workers.push(worker);

      if (this.done) {
        this.done();
      }
    });
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tap({ name: 'reload-server' }, (compilation, callback) => {
      this.done = callback;

      this.workers.forEach((worker) => {
        try {
          process.kill(worker.process.pid, 'SIGTERM');
        } catch (e) {
          // eslint-disable-next-line
          console.warn(`Unable to kill process #${worker.process.pid}`);
        }
      });

      this.workers = [];

      cluster.fork();
    });
  }
}

/** @type {import('webpack').Configuration} */
module.exports = {
  ...config,
  mode: 'development', // Tells webpack to use its built-in optimizations for development.
  devtool: 'eval-cheap-source-map', // Choose a style of source mapping to enhance the debugging process.
  watch: true, // Tells webpack to continue to watch for changes in any of the resolved files.
  plugins: [
    ...config.plugins,
    new ReloadServerPlugin(), // Automatically (re)start server between builds.
  ],
};
