import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctx = GqlExecutionContext.create(context);
        const req = ctx.getContext().req;

        const authHeader = req.headers.authorization;
        if (!authHeader) throw new UnauthorizedException();

        const token = authHeader.replace('Bearer ', '');
        const user = await this.authService.validateToken(token);

        req.user = user;
        return true;
    }
}
