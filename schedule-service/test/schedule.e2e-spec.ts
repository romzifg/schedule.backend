import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest'; // Ubah ini

import { TestAppModule } from './test-app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthService } from '../src/auth/auth.service';
import {
  createMockPrismaService,
  mockSchedules,
} from './mocks/prisma.service.mock';

// Mock AuthService
const mockAuthService = {
  validateToken: jest.fn().mockImplementation(async (token: string) => {
    if (token !== 'valid-token') {
      throw new Error('Invalid token');
    }
    return {
      id: 'user-1',
      email: 'test@mail.com',
    };
  }),
};

describe('Schedule Service (E2E)', () => {
  let app: INestApplication;
  let mockPrismaService: any;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-key';
    process.env.JWT_EXPIRES = '1d';
    process.env.AUTH_SERVICE_URL = 'http://mock-auth-service';

    mockPrismaService = createMockPrismaService();

    const moduleRef = await Test.createTestingModule({
      imports: [TestAppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  beforeEach(() => {
    mockSchedules.length = 0;
    jest.clearAllMocks();
  });

  describe('Authentication', () => {
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

    it('should reject request with invalid token', async () => {
      const res = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', 'Bearer invalid-token')
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

    it('should accept request with valid token', async () => {
      const res = await request(app.getHttpServer())
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

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.customers).toBeDefined();
    });
  });

  describe('Customer Operations', () => {
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

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.createCustomer).toBeDefined();
      expect(res.body.data.createCustomer.name).toBe('John');
      expect(res.body.data.createCustomer.email).toBe('john@mail.com');
    });

    it('should get all customers', async () => {
      const res = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', 'Bearer valid-token')
        .send({
          query: `
            query {
              customers {
                id
                name
                email
              }
            }
          `,
        });

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.customers).toBeDefined();
      expect(Array.isArray(res.body.data.customers)).toBe(true);
    });
  });

  describe('Doctor Operations', () => {
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

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.createDoctor).toBeDefined();
      expect(res.body.data.createDoctor.name).toBe('Dr. Strange');
    });

    it('should get all doctors', async () => {
      const res = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', 'Bearer valid-token')
        .send({
          query: `
            query {
              doctors {
                id
                name
              }
            }
          `,
        });

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.doctors).toBeDefined();
      expect(Array.isArray(res.body.data.doctors)).toBe(true);
    });
  });

  describe('Schedule Operations', () => {
    it('should create schedule successfully', async () => {
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
                customerId
                doctorId
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

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.createSchedule).toBeDefined();
      expect(res.body.data.createSchedule.objective).toBe('Consultation');
    });

    it('should reject schedule conflict', async () => {
      const customerRes = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', 'Bearer valid-token')
        .send({
          query: `query { customers { id } }`,
        });

      const customerId = customerRes.body.data.customers[0].id;

      const doctorRes = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', 'Bearer valid-token')
        .send({
          query: `query { doctors { id } }`,
        });

      const doctorId = doctorRes.body.data.doctors[0].id;
      const scheduledAt = new Date(Date.now() + 7200000).toISOString();

      await request(app.getHttpServer())
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
              objective: 'First Appointment',
              customerId,
              doctorId,
              scheduledAt,
            },
          },
        });

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
              objective: 'Conflict Appointment',
              customerId,
              doctorId,
              scheduledAt,
            },
          },
        });

      expect(res.body.errors).toBeDefined();
    });

    it('should get all schedules', async () => {
      const res = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', 'Bearer valid-token')
        .send({
          query: `
            query {
              schedules {
                id
                objective
              }
            }
          `,
        });

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.schedules).toBeDefined();
      expect(Array.isArray(res.body.data.schedules)).toBe(true);
    });
  });
});