import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
    private readonly username = process.env.AUTH_USERNAME ?? 'admin';
    private readonly password = process.env.AUTH_PASSWORD ?? 'admin123';
    private readonly token = process.env.AUTH_TOKEN ?? 'contacts-demo-token';

    login(username: string, password: string) {
        if (username !== this.username || password !== this.password) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return {
            token: this.token,
            username: this.username,
        };
    }

    isValidToken(token?: string) {
        return token === this.token;
    }
}
