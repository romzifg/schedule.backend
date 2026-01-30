import { ExecutionContext, Injectable } from '@nestjs/common';
import { CanActivate } from '@nestjs/common';

@Injectable()
export class MockAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const gqlContext = context.getArgByIndex(2);
        const req = gqlContext.req;
        const authHeader = req?.headers?.authorization;

        if (!authHeader || authHeader !== 'Bearer valid-token') {
            return false;
        }

        req.user = {
            id: 'user-1',
            email: 'test@mail.com',
        };

        return true;
    }
}