import { Injectable } from '@nestjs/common';
import { join } from 'path';

@Injectable()
export class AppService {
  getFrontendIndexPath(): string {
    return join(process.cwd(), 'frontend', 'dist', 'index.html');
  }
}
