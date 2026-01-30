import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;

  const prismaMock = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const jwtMock = {
    sign: jest.fn().mockReturnValue('mock-token'),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtMock },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('register should return token', async () => {
    prismaMock.user.create.mockResolvedValue({
      id: 'uuid',
      email: 'test@mail.com',
      password: 'hashed',
    });

    const token = await service.register({
      email: 'test@mail.com',
      password: '123456',
    });

    expect(token).toBe('mock-token');
  });
});
