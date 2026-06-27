import { Controller, Get, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

const GITHUB_REPO = 'zico404/luckyvault';
const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
const FALLBACK_VERSION = '1.0.0';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let versionCache: { version: string; apkUrl: string; updatedAt: number } | null = null;

@Controller('download')
export class DownloadController {
  constructor(private configService: ConfigService) {}

  @Get('apk')
  async downloadApk(@Res() res: Response) {
    const apkUrl = this.configService.get('APK_DOWNLOAD_URL', '');

    if (apkUrl) {
      return res.redirect(apkUrl);
    }

    return res.redirect('https://github.com/zico404/luckyvault/releases/latest/download/LuckyVault-debug.apk');
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
          apkUrl: versionCache?.apkUrl || `https://github.com/${GITHUB_REPO}/releases/latest/download/LuckyVault-debug.apk`,
          updatedAt: versionCache?.updatedAt || now,
        };
      }

      const release = await response.json() as any;
      const tagName = release.tag_name || '';
      const version = tagName.replace(/^v/i, '') || FALLBACK_VERSION;

      const debugAsset = release.assets?.find((a: any) => a.name?.includes('debug'));
      const apkUrl = debugAsset?.browser_download_url
        || `https://github.com/${GITHUB_REPO}/releases/latest/download/LuckyVault-debug.apk`;

      versionCache = { version, apkUrl, updatedAt: now };
      return versionCache;
    } catch {
      return {
        version: versionCache?.version || FALLBACK_VERSION,
        apkUrl: versionCache?.apkUrl || `https://github.com/${GITHUB_REPO}/releases/latest/download/LuckyVault-debug.apk`,
        updatedAt: versionCache?.updatedAt || now,
      };
    }
  }
}
