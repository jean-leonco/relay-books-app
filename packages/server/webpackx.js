import path from 'path';
import { spawn } from 'child_process';

import webpack from 'webpack';

import config, { outputPath, outputFilename } from './webpack/webpack.config';

const compilerRunPromise = compiler =>
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
    childProcess.once('exit', (code, signal) => {
      if (code === 0) {
        resolve(undefined);
      } else {
        reject(new Error('Exit with error code:' + code));
      }
    });
    childProcess.once('error', err => {
      reject(err);
    });
  });
}

const runProgram = async () => {
  const outputFile = path.join(outputPath, outputFilename);

  const program = spawn(process.execPath, [outputFile], {
    stdio: [process.stdin, process.stdout, process.stderr],
    std: 'inherit',
    shell: true,
  });

  await onExit(program);
};

(async () => {
  try {
    const wpConfig = {
      ...config,
      entry: path.join(__dirname, process.argv[2]),
    };

    const compiler = webpack(wpConfig);

    await compilerRunPromise(compiler);

    await runProgram();
  } catch (err) {
    // eslint-disable-next-line
    console.log('err:', err);
    process.exit(1);
  }
  process.exit(0);
})();
