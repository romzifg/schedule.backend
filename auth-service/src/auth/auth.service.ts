import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import axios from 'axios';

import { PrismaService } from '../prisma/prisma.service';
import { RegisterInput } from '../dto/register.input';
import { LoginInput } from '../dto/login.input';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(input: RegisterInput): Promise<string> {
        const hashedPassword = await bcrypt.hash(input.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: input.email,
                password: hashedPassword,
            },
        });

        return this.signToken(user.id, user.email);
    }

    async login(input: LoginInput): Promise<string> {
        const user = await this.prisma.user.findUnique({
            where: { email: input.email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isValid = await bcrypt.compare(
            input.password,
            user.password,
        );

        if (!isValid) {
            throw new UnauthorizedException('Invalid credentials');
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
                },
            );

            return response.data.data.validateToken;
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}
