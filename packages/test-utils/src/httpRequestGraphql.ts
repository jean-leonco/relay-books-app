import Koa from 'koa';
import request from 'supertest';

interface Header {
  authorization?: string | null;
  appplatform?: string;
}

export const httpRequestGraphql = async (payload: any, header: Header, app: Koa<any, any>) => {
  return request(app.callback())
    .post('/graphql')
    .set({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...header,
    })
    .send(JSON.stringify(payload));
};
