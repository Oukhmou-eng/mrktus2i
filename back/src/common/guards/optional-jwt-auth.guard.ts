import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(err: unknown, user: TUser | false) {
    if (err && !(err instanceof UnauthorizedException)) throw err;
    return user || null;
  }
}
