import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly authService: AuthService) { }

    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest<{ headers: Record<string, string | undefined>; }>();
        const authorization = request.headers.authorization;

        if (!authorization?.startsWith('Bearer ')) {
            throw new UnauthorizedException('Authentication required');
        }

        const token = authorization.slice('Bearer '.length);

        if (!this.authService.isValidToken(token)) {
            throw new UnauthorizedException('Invalid token');
        }

        return true;
    }
}
