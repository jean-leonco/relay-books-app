import Koa from 'koa';
import request from 'supertest';

interface Header {
  authorization?: string | null;
  appplatform?: string;
}

export async function httpRequestGraphql(payload: any, header: Header, app: Koa<any, any>) {
  const { authorization, appplatform, ...rest } = header;

  return await request(app.callback())
    .post('/graphql')
    .set({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(authorization ? { authorization } : {}),
      ...(appplatform ? { appplatform } : {}),
      ...rest,
    })
    .send(JSON.stringify(payload));
}
