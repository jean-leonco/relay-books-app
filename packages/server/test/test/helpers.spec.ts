import { bumpDate, ONE_DAY_IN_MILLISECONDS } from '../helpers';

describe('helpers tests', () => {
  it('bumps date one day at a time', () => {
    bumpDate();
    const t1 = new Date();
    bumpDate();
    const t2 = new Date();
    expect(t1.valueOf() + ONE_DAY_IN_MILLISECONDS).toEqual(t2.valueOf());
  });
});
