import * as withMongooseFields from '../withMongooseFields';

it('should snapshot mongoose fields', async () => {
  expect({ ...withMongooseFields }).toMatchSnapshot();
});
