import 'core-js';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import { printSchema } from 'graphql/utilities';

import schema from '../src/schema/schema';

const writeFileAsync = promisify(fs.writeFile);

const schemaFolderSrc = './schema/schema.graphql';
const schemaFileDest = '../schema/schema.graphql';

const copySchemaToProject = () => {
  try {
    fs.copyFileSync(schemaFolderSrc, schemaFileDest);
    // eslint-disable-next-line
    console.info(`Schema successfully copied to: ${schemaFileDest}`);
  } catch (error) {
    // eslint-disable-next-line
    console.error(`Error while trying to copy schema to: ${schemaFileDest}`, error);
  }
};

(async () => {
  await writeFileAsync(path.join(__dirname, `../schema/schema.graphql`), printSchema(schema));
  copySchemaToProject();
  process.exit(0);
})();
