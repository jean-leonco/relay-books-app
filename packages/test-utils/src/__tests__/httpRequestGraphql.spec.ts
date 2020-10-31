import Koa from 'koa';
import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';

import { httpRequestGraphql } from '../httpRequestGraphql';

const app = new Koa<any, any>();
const router = new Router<any, any>();

router.post('/graphql', (ctx) => {
  ctx.body = 'httpRequestGraphql';
  ctx.status = 200;
});

app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());

describe('httpRequestGraphql', () => {
  it('should call the server and receive response', async () => {
    const payload = {
      query: ``,
      variables: {},
    };
    const header = {};
    const response = await httpRequestGraphql(payload, header, app);

    expect(response.status).toBe(200);
    expect(response.text).toBe('httpRequestGraphql');
  });
});
