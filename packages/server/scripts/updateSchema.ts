import 'core-js';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import { printSchema } from 'graphql/utilities';

import { schema } from '../src/graphql/schema';

const writeFileAsync = promisify(fs.writeFile);

(async () => {
  await writeFileAsync(path.join(__dirname, `../schema/schema.graphql`), printSchema(schema));

  process.exit(0);
})();
