import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // rota sem restrição de papel, mas ainda exige login (via JwtAuthGuard)
    }

    const { user } = context.switchToHttp().getRequest();

    if (!requiredRoles.includes(user.papel)) {
      throw new ForbiddenException(
        'Não tens permissão para aceder a este recurso',
      );
    }

    return true;
  }
}
