import { Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AuthService {
    async validateToken(token: string) {
        try {
            const res = await axios.post(
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

            return res.data.data.validateToken;
        } catch {
            throw new UnauthorizedException('Invalid token');
        }
    }
}
