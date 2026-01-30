import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { RegisterInput } from '../dto/register.input';
import { LoginInput } from '../dto/login.input';
import { User } from '../model/user.model';

@Resolver()
export class AuthResolver {
    constructor(private authService: AuthService) { }

    @Mutation(() => String)
    register(@Args('input') input: RegisterInput) {
        return this.authService.register(input);
    }

    @Mutation(() => String)
    login(@Args('input') input: LoginInput) {
        return this.authService.login(input);
    }

    /**
     * Dipakai service lain untuk validasi token
     */
    @UseGuards(AuthGuard('jwt'))
    @Query(() => User)
    validateToken(@Context('req') req) {
        return req.user;
    }
}
