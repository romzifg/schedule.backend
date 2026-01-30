import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';

describe('AuthService (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('register user', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation Register($input: RegisterInput!) {
            register(input: $input)
          }
        `,
        variables: {
          input: {
            email: 'e2e@test.com',
            password: '123456',
          },
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.data.register).toBeDefined();
  });

  it('login user', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation Login($input: LoginInput!) {
            login(input: $input)
          }
        `,
        variables: {
          input: {
            email: 'e2e@test.com',
            password: '123456',
          },
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.data.login).toBeDefined();

    accessToken = res.body.data.login;
  });

  it('validate token', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        query: `
          query {
            validateToken {
              id
              email
            }
          }
        `,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.validateToken.email).toBe(
      'e2e@test.com',
    );
  });

  it('reject invalid token', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', 'Bearer invalid-token')
      .send({
        query: `
          query {
            validateToken {
              id
            }
          }
        `,
      });

    expect(res.body.errors).toBeDefined();
  });
});
