import { Module } from '@nestjs/common';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [ContactsController],
  providers: [ContactsService],
  imports: [PrismaModule, AuthModule]
})
export class ContactsModule {}
