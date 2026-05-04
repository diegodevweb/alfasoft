import {
  ArgumentMetadata,
  BadRequestException,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '../src/auth/auth.guard';
import { AuthService } from '../src/auth/auth.service';
import { ContactsController } from '../src/contacts/contacts.controller';
import { ContactsService } from '../src/contacts/contacts.service';
import { CreateContactDto } from '../src/contacts/dto/create-contact.dto/create-contact.dto';
import { UpdateContactDto } from '../src/contacts/dto/update-contact.dto/update-contact.dto';

describe('Contacts validation flow', () => {
  const validationPipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  const createMetadata: ArgumentMetadata = {
    type: 'body',
    metatype: CreateContactDto,
    data: '',
  };

  const updateMetadata: ArgumentMetadata = {
    type: 'body',
    metatype: UpdateContactDto,
    data: '',
  };

  it('rejects invalid create payloads', async () => {
    await expect(
      validationPipe.transform(
        {
          name: 'John',
          contact: '123',
          email: 'invalid-email',
        },
        createMetadata,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects invalid update payloads', async () => {
    await expect(
      validationPipe.transform(
        {
          contact: '12',
        },
        updateMetadata,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('requires a picture when creating a contact', async () => {
    const service = {
      create: jest.fn(),
    } as unknown as ContactsService;

    const controller = new ContactsController(service);

    await expect(
      controller.create(undefined as never, {
        name: 'Valid Name',
        contact: '123456789',
        email: 'valid@example.com',
      }),
    ).rejects.toThrow(new BadRequestException('Picture is required'));
  });
});

describe('Authentication flow', () => {
  it('rejects protected access without bearer token', () => {
    const guard = new AuthGuard(new AuthService());

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
        }),
      }),
    } as never;

    expect(() => guard.canActivate(context)).toThrow(
      new UnauthorizedException('Authentication required'),
    );
  });

  it('accepts valid credentials', () => {
    const authService = new AuthService();

    expect(authService.login('admin', 'admin123')).toEqual({
      token: 'contacts-demo-token',
      username: 'admin',
    });
  });
});
