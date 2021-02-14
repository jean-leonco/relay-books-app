import 'core-js';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import { printSchema } from 'graphql/utilities';

import schema from '../src/schema/schema';

const writeFileAsync = promisify(fs.writeFile);

const schemaFileDest = '../../schema/schema.graphql';

(async () => {
  await writeFileAsync(path.join(__dirname, schemaFileDest), printSchema(schema));
  // eslint-disable-next-line no-console
  console.log(`Schema successfully copied to: ${schemaFileDest}`);
  process.exit(0);
})();
