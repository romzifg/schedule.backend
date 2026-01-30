import { INestApplication, ExecutionContext } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AuthService (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let accessToken: string;

  const hashedPassword = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

  const mockUser = {
    id: 'test-user-id',
    email: 'e2e@test.com',
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let createdUser = { ...mockUser };

  const mockPrismaService = {
    user: {
      create: jest.fn().mockImplementation(async (args) => {
        createdUser = {
          id: 'test-user-id',
          email: args.data.email,
          password: args.data.password,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        return createdUser;
      }),
      findUnique: jest.fn().mockImplementation(async (args) => {

        const { where, select } = args;

        if (where?.email === 'e2e@test.com') {
          if (select) {
            const result: any = {};
            Object.keys(select).forEach(key => {
              if (createdUser[key] !== undefined) {
                result[key] = createdUser[key];
              }
            });
            return result;
          }
          return createdUser;
        }

        if (where?.id === 'test-user-id') {
          if (select) {
            const result: any = {};
            Object.keys(select).forEach(key => {
              if (createdUser[key] !== undefined) {
                result[key] = createdUser[key];
              }
            });
            return result;
          }
          return createdUser;
        }

        return null;
      }),
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
  };

  const mockAuthGuard = {
    canActivate: (context: ExecutionContext) => {
      const gqlContext = context.getArgByIndex(2);
      const req = gqlContext.req;
      const authHeader = req?.headers?.authorization;

      if (!authHeader) {
        return false;
      }

      const token = authHeader.replace('Bearer ', '');

      try {
        if (token && token !== 'invalid-token') {
          const decoded = jwtService.verify(token);

          req.user = {
            id: decoded.sub,
            email: decoded.email,
            createdAt: createdUser.createdAt,
            updatedAt: createdUser.updatedAt,
          };
          return true;
        }
        return false;
      } catch (error) {
        return false;
      }
    },
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-key';
    process.env.JWT_EXPIRES = '1d';

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideGuard(AuthGuard('jwt'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    jwtService = moduleFixture.get<JwtService>(JwtService);

    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
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
    expect(res.body.errors).toBeUndefined();
    expect(res.body.data?.register).toBeDefined();
    expect(typeof res.body.data.register).toBe('string');
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
    expect(res.body.errors).toBeUndefined();
    expect(res.body.data?.login).toBeDefined();

    accessToken = res.body.data.login;
  });

  it('validate token', async () => {
    expect(accessToken).toBeDefined();

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
    expect(res.body.errors).toBeUndefined();
    expect(res.body.data?.validateToken).toBeDefined();
    expect(res.body.data.validateToken.email).toBe('e2e@test.com');
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

  it('reject invalid credentials', async () => {
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
            password: 'wrong-password',
          },
        },
      });

    expect(res.body.errors).toBeDefined();
  });

  it('reject non-existent user login', async () => {
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
            email: 'nonexistent@test.com',
            password: '123456',
          },
        },
      });

    expect(res.body.errors).toBeDefined();
  });
});