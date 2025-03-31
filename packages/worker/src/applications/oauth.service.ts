import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppOAuthTokenSet } from '@jptr/braille-prisma';
import { Issuer } from 'openid-client';

import { prisma } from '../prisma';

@Injectable()
export class OAuthService {
  private redirectUri: string;

  constructor(private configService: ConfigService) {
    this.redirectUri = `${this.configService.get(
      'BASE_URL',
    )}/api/apps/auth/oauth-callback`;
  }

  async ensureFreshToken(
    integrationId: string,
    tokenset: AppOAuthTokenSet | null,
  ) {
    if (!tokenset) {
      throw new Error('Missing tokenset for integration');
    }

    const now = Math.ceil(Date.now() / 1000);
    const isExpired = now > tokenset.expiresAt;
    const expiresSoon = now - 60 > tokenset.expiresAt;

    if (isExpired || expiresSoon) {
      const client = await this.getOIDClient(integrationId);
      const refreshedTokenSet = await client.refresh(tokenset.refreshToken);

      return prisma.appOAuthTokenSet.update({
        where: {
          id: tokenset.id,
        },
        data: {
          accessToken: refreshedTokenSet.access_token,
          refreshToken: refreshedTokenSet.refresh_token,
          expiresAt: refreshedTokenSet.expires_at,
          scope: refreshedTokenSet.scope,
        },
      });
    }

    return tokenset;
  }

  async getOIDClient(appId: string) {
    const app = await prisma.app.findFirst({
      where: {
        id: appId,
      },
      include: {
        versions: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
        },
        appOAuthClientSecret: true,
      },
    });

    const version = app?.versions[0];

    if (!version) {
      throw new Error('No integration found');
    }

    if (!app.appOAuthClientSecret) {
      throw new Error('No client secret found');
    }

    const oidcUrl = (version.schema as any)?.components.securitySchemes.OpenID
      .openIdConnectUrl;

    const { Client } = await Issuer.discover(oidcUrl);

    return new Client({
      client_id: app.appOAuthClientSecret.clientId,
      client_secret: app.appOAuthClientSecret.clientSecret,
      redirect_uris: [this.redirectUri],
    });
  }
}
