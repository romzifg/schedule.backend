import { Test } from '@nestjs/testing';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';

describe('AuthResolver', () => {
  let resolver: AuthResolver;

  const authServiceMock = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthResolver,
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compile();

    resolver = module.get(AuthResolver);
  });

  it('register calls authService', async () => {
    authServiceMock.register.mockResolvedValue('token');

    const result = await resolver.register({
      email: 'test@mail.com',
      password: '123456',
    });

    expect(result).toBe('token');
  });
});
