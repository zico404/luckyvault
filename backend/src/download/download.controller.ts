import { Controller, Get, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

const GITHUB_REPO = 'zico404/luckyvault';
const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
const RAW_APK_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/apks/LuckyVault-debug.apk`;
const FALLBACK_VERSION = '1.0.0';
const CACHE_TTL_MS = 5 * 60 * 1000;

let versionCache: { version: string; apkUrl: string; updatedAt: number } | null = null;

@Controller('download')
export class DownloadController {
  constructor(private configService: ConfigService) {}

  @Get('apk')
  async downloadApk(@Res() res: Response) {
    return res.redirect(RAW_APK_URL);
  }

  @Get('version')
  async getVersion() {
    const now = Date.now();

    if (versionCache && now - versionCache.updatedAt < CACHE_TTL_MS) {
      return versionCache;
    }

    try {
      const response = await fetch(GITHUB_API, {
        headers: { 'Accept': 'application/vnd.github.v3+json' },
      });

      if (!response.ok) {
        return {
          version: versionCache?.version || FALLBACK_VERSION,
          apkUrl: RAW_APK_URL,
          updatedAt: versionCache?.updatedAt || now,
        };
      }

      const release = await response.json() as any;
      const tagName = release.tag_name || '';
      const version = tagName.replace(/^v/i, '') || FALLBACK_VERSION;

      versionCache = { version, apkUrl: RAW_APK_URL, updatedAt: now };
      return versionCache;
    } catch {
      return {
        version: versionCache?.version || FALLBACK_VERSION,
        apkUrl: RAW_APK_URL,
        updatedAt: versionCache?.updatedAt || now,
      };
    }
  }
}
