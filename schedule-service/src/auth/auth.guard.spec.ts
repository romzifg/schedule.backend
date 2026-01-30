import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { GqlExecutionContext } from '@nestjs/graphql';

import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('AuthGuard', () => {
    let guard: AuthGuard;

    const authServiceMock = {
        validateToken: jest.fn(),
    };

    const mockExecutionContext = (headers: any = {}) => {
        const req = { headers };

        return {
            switchToHttp: () => ({
                getRequest: () => req,
            }),
            getHandler: jest.fn(),
            getClass: jest.fn(),
        } as unknown as ExecutionContext;
    };

    beforeEach(async () => {
        jest
            .spyOn(GqlExecutionContext, 'create')
            .mockImplementation((context: ExecutionContext) => {
                return {
                    getContext: () => ({
                        req: context.switchToHttp().getRequest(),
                    }),
                } as any;
            });

        const moduleRef = await Test.createTestingModule({
            providers: [
                AuthGuard,
                { provide: AuthService, useValue: authServiceMock },
            ],
        }).compile();

        guard = moduleRef.get(AuthGuard);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should allow request with valid token', async () => {
        authServiceMock.validateToken.mockResolvedValue({
            id: 'user-1',
            email: 'test@mail.com',
        });

        const context = mockExecutionContext({
            authorization: 'Bearer valid-token',
        });

        const result = await guard.canActivate(context);

        expect(result).toBe(true);
        expect(authServiceMock.validateToken).toBeCalledWith(
            'valid-token',
        );

        const req = context.switchToHttp().getRequest();
        expect(req.user).toEqual({
            id: 'user-1',
            email: 'test@mail.com',
        });
    });

    it('should throw Unauthorized if no authorization header', async () => {
        const context = mockExecutionContext();

        await expect(guard.canActivate(context)).rejects.toThrow(
            UnauthorizedException,
        );
    });

    it('should throw Unauthorized if token invalid', async () => {
        authServiceMock.validateToken.mockRejectedValue(
            new UnauthorizedException(),
        );

        const context = mockExecutionContext({
            authorization: 'Bearer invalid-token',
        });

        await expect(guard.canActivate(context)).rejects.toThrow(
            UnauthorizedException,
        );
    });
});
