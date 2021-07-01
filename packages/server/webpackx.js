const { spawn } = require('child_process');
const path = require('path');

const webpack = require('webpack');

const config = require('./webpack.config');

const cwd = process.cwd();

const entryRoot = path.join(__dirname, '.');
const outputPath = path.join(__dirname, '.webpackx');
const outputFilename = 'bundle.js';

const compilerRunPromise = (compiler) =>
  new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        return reject(err);
      }

      if (stats && stats.hasErrors()) {
        reject(err || stats.toString());
      }

      resolve(stats);
    });
  });

function onExit(childProcess) {
  return new Promise((resolve, reject) => {
    childProcess.once('exit', (code) => {
      if (code === 0) {
        resolve(undefined);
      } else {
        reject(new Error(`Exit with error code: ${code}`));
      }
    });
    childProcess.once('error', (err) => {
      reject(err);
    });
  });
}

const runProgram = async () => {
  const outputFile = path.join(outputPath, outputFilename);
  const execArgs = process.argv.slice(3);

  const childProcess = spawn(process.execPath, [outputFile, ...execArgs], {
    stdio: [process.stdin, process.stdout, process.stderr],
  });

  await onExit(childProcess);
};

(async () => {
  try {
    const entry = path.join(cwd, process.argv[2]);

    const rules = config.module.rules.map((rule) => {
      if (rule.loader !== 'esbuild-loader') {
        return rule;
      }

      return {
        ...rule,
        include: [entryRoot],
      };
    });

    /** @type {import('webpack').Configuration} */
    const wpConfig = {
      ...config,
      mode: 'development',
      devtool: 'eval-cheap-source-map',
      entry,
      output: {
        path: outputPath,
        filename: outputFilename,
      },
      module: {
        rules,
      },
    };

    const compiler = webpack(wpConfig);

    await compilerRunPromise(compiler);

    await runProgram();
  } catch (err) {
    // eslint-disable-next-line
    console.log('err: ', err);
    process.exit(1);
  }
  process.exit(0);
})();
