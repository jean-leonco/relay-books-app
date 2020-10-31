import fs from 'fs';

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

(() => {
  copySchemaToProject();
})();
