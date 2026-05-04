import { Controller, Get, Res } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';
import type { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getRoot(@Res() res: Response) {
    const indexPath = this.appService.getFrontendIndexPath();

    if (existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }

    return res.send('Frontend build not found.');
  }

  @Get(['login', 'app'])
  getAppShell(@Res() res: Response) {
    const indexPath = this.appService.getFrontendIndexPath();

    if (existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }

    return res.send('Frontend build not found.');
  }
}
