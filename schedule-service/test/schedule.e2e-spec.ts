import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';

describe('Schedule Service (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AuthService)
      .useValue({
        validateToken: jest.fn((token: string) => {
          if (token === 'valid-token') {
            return {
              id: 'user-1',
              email: 'test@mail.com',
            };
          }
          throw new UnauthorizedException();
        }),
      })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject request without token', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          query {
            customers {
              id
            }
          }
        `,
      });

    expect(res.body.errors).toBeDefined();
  });

  it('should create customer with valid token', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', 'Bearer valid-token')
      .send({
        query: `
          mutation CreateCustomer($input: CreateCustomerInput!) {
            createCustomer(input: $input) {
              id
              name
              email
            }
          }
        `,
        variables: {
          input: {
            name: 'John',
            email: 'john@mail.com',
          },
        },
      });

    expect(res.body.data.createCustomer).toBeDefined();
  });

  it('should create doctor with valid token', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', 'Bearer valid-token')
      .send({
        query: `
          mutation CreateDoctor($input: CreateDoctorInput!) {
            createDoctor(input: $input) {
              id
              name
            }
          }
        `,
        variables: {
          input: {
            name: 'Dr. Strange',
          },
        },
      });

    expect(res.body.data.createDoctor).toBeDefined();
  });

  it('should create schedule successfully', async () => {
    // get customer
    const customerRes = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', 'Bearer valid-token')
      .send({
        query: `
          query {
            customers {
              id
            }
          }
        `,
      });

    const customerId = customerRes.body.data.customers[0].id;

    // get doctor
    const doctorRes = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', 'Bearer valid-token')
      .send({
        query: `
          query {
            doctors {
              id
            }
          }
        `,
      });

    const doctorId = doctorRes.body.data.doctors[0].id;

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', 'Bearer valid-token')
      .send({
        query: `
          mutation CreateSchedule($input: CreateScheduleInput!) {
            createSchedule(input: $input) {
              id
              objective
            }
          }
        `,
        variables: {
          input: {
            objective: 'Consultation',
            customerId,
            doctorId,
            scheduledAt: new Date().toISOString(),
          },
        },
      });

    expect(res.body.data.createSchedule).toBeDefined();
  });

  it('should reject schedule conflict', async () => {
    const now = new Date().toISOString();

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', 'Bearer valid-token')
      .send({
        query: `
          mutation CreateSchedule($input: CreateScheduleInput!) {
            createSchedule(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            objective: 'Conflict',
            customerId: 'any',
            doctorId: 'any',
            scheduledAt: now,
          },
        },
      });

    expect(res.body.errors).toBeDefined();
  });
});
