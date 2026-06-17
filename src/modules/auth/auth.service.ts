import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { JwtPayload } from './interfaces/authenticated-request.interface';

@Injectable()
export class AuthService {
  login(username: string, password: string): { accessToken: string } {
    if (!this.isValidCredentials(username, password)) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    return {
      accessToken: this.signToken({
        sub: username,
        username,
      }),
    };
  }

  verifyToken(token: string): JwtPayload {
    const [encodedHeader, encodedPayload, signature] = token.split('.');

    if (!encodedHeader || !encodedPayload || !signature) {
      throw new UnauthorizedException('Token JWT invalide');
    }

    const expectedSignature = this.sign(`${encodedHeader}.${encodedPayload}`);

    if (!this.safeCompare(signature, expectedSignature)) {
      throw new UnauthorizedException('Token JWT invalide');
    }

    const payload = this.decodePayload(encodedPayload);
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp <= now) {
      throw new UnauthorizedException('Token JWT expiré');
    }

    return payload;
  }

  private signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    const now = Math.floor(Date.now() / 1000);
    const fullPayload: JwtPayload = {
      ...payload,
      iat: now,
      exp: now + this.getJwtTtlSeconds(),
    };

    const header = this.encode({ alg: 'HS256', typ: 'JWT' });
    const body = this.encode(fullPayload);
    const signature = this.sign(`${header}.${body}`);

    return `${header}.${body}.${signature}`;
  }

  private sign(data: string): string {
    return createHmac('sha256', this.getJwtSecret()).update(data).digest('base64url');
  }

  private decodePayload(encodedPayload: string): JwtPayload {
    try {
      const payload = JSON.parse(
        Buffer.from(encodedPayload, 'base64url').toString('utf8'),
      ) as Partial<JwtPayload>;

      if (
        typeof payload.sub !== 'string' ||
        typeof payload.username !== 'string' ||
        typeof payload.iat !== 'number' ||
        typeof payload.exp !== 'number'
      ) {
        throw new Error('Invalid payload');
      }

      return payload as JwtPayload;
    } catch {
      throw new UnauthorizedException('Token JWT invalide');
    }
  }

  private encode(value: unknown): string {
    return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');
  }

  private isValidCredentials(username: string, password: string): boolean {
    const expectedUsername = process.env.AUTH_USERNAME || 'admin';
    const expectedPassword = process.env.AUTH_PASSWORD || 'admin';

    return (
      this.safeCompare(username, expectedUsername) && this.safeCompare(password, expectedPassword)
    );
  }

  private safeCompare(value: string, expectedValue: string): boolean {
    const valueBuffer = Buffer.from(value);
    const expectedBuffer = Buffer.from(expectedValue);

    if (valueBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(valueBuffer, expectedBuffer);
  }

  private getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      if (process.env.NODE_ENV === 'production') {
        throw new InternalServerErrorException('JWT_SECRET manquant');
      }

      return 'dev-secret-change-me';
    }

    return secret;
  }

  private getJwtTtlSeconds(): number {
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    const match = /^(\d+)([smhd])?$/.exec(expiresIn);

    if (!match) {
      return 24 * 60 * 60;
    }

    const value = Number(match[1]);
    const unit = match[2] || 's';
    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 60 * 60,
      d: 24 * 60 * 60,
    };

    return value * multipliers[unit];
  }
}
