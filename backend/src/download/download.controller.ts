import { Controller, Get, Res, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('download')
export class DownloadController {
  constructor(private configService: ConfigService) {}

  @Get('apk')
  async downloadApk(@Res() res: Response) {
    const apkUrl = this.configService.get('APK_DOWNLOAD_URL', '');

    if (apkUrl) {
      return res.redirect(apkUrl);
    }

    // Fallback: try to serve from local apks/ directory
    const apkPath = path.join(process.cwd(), 'apks', 'LuckyVault.apk');
    if (fs.existsSync(apkPath)) {
      res.set({
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': 'attachment; filename="LuckyVault.apk"',
      });
      return res.sendFile(apkPath);
    }

    // Fallback: redirect to GitHub releases
    return res.redirect('https://github.com/zico404/luckyvault/releases/latest/download/LuckyVault.apk');
  }
}
