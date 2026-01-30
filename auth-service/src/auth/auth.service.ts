import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import axios from 'axios';

import { PrismaService } from '../prisma/prisma.service';
import { RegisterInput } from '../dto/register.input';
import { LoginInput } from '../dto/login.input';
import { AuthErrors } from './auth.error';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(input: RegisterInput): Promise<string> {
        try {
            const hashedPassword = await bcrypt.hash(input.password, 10);

            const user = await this.prisma.user.create({
                data: {
                    email: input.email,
                    password: hashedPassword,
                },
            });

            return this.signToken(user.id, user.email);
        } catch (error) {
            if (error.code === 'P2002') {
                throw AuthErrors.EMAIL_ALREADY_EXISTS();
            }

            throw AuthErrors.INTERNAL_ERROR();
        }
    }

    async login(input: LoginInput): Promise<string> {
        const user = await this.prisma.user.findUnique({
            where: { email: input.email },
        });

        if (!user) {
            throw AuthErrors.INVALID_CREDENTIALS();
        }

        const isValid = await bcrypt.compare(
            input.password,
            user.password,
        );

        if (!isValid) {
            throw AuthErrors.INVALID_CREDENTIALS();
        }

        return this.signToken(user.id, user.email);
    }


    private signToken(userId: string, email: string): string {
        return this.jwtService.sign({
            sub: userId,
            email,
        });
    }

    async validateToken(token: string) {
        try {
            const response = await axios.post(
                process.env.AUTH_SERVICE_URL!,
                {
                    query: `
                        query {
                            validateToken {
                            id
                            email
                            }
                        }
                    `,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    timeout: 5000,
                },
            );

            return response.data.data.validateToken;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    throw AuthErrors.INVALID_TOKEN();
                }

                if (!error.response) {
                    // Network / timeout
                    throw AuthErrors.TOKEN_SERVICE_UNAVAILABLE();
                }
            }

            throw AuthErrors.INTERNAL_ERROR();
        }
    }

}
