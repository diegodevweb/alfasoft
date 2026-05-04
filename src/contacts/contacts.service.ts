import {
    Injectable,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto/update-contact.dto';

@Injectable()
export class ContactsService {
    constructor(private prisma: PrismaService) { }

    private async removePictureFile(filename?: string) {
        if (!filename) {
            return;
        }

        try {
            await unlink(join(process.cwd(), 'uploads', filename));
        } catch (error: unknown) {
            if (
                typeof error === 'object' &&
                error !== null &&
                'code' in error &&
                error.code === 'ENOENT'
            ) {
                return;
            }

            throw error;
        }
    }

    async findAll() {
        return this.prisma.contact.findMany({
            orderBy: { id: 'desc' },
        });
    }

    async findOne(id: number) {
        const contact = await this.prisma.contact.findUnique({
            where: { id },
        });
        if (!contact) {
            throw new NotFoundException('Contact not found');
        }
        return contact;
    }

    async create(data: CreateContactDto) {
        try {
            return await this.prisma.contact.create({
                data: {
                    name: data.name,
                    contact: data.contact,
                    email: data.email,
                    picture: data.picture!,
                },
            });
        } catch (error) {
            await this.removePictureFile(data.picture);

            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new ConflictException('Email or contact already exists');
            }

            throw error;
        }
    }

    async remove(id: number) {
        const contact = await this.findOne(id);
        await this.prisma.contact.delete({
            where: { id },
        });
        await this.removePictureFile(contact.picture);
    }

    async update(id: number, data: UpdateContactDto) {
        const existingContact = await this.findOne(id);

        try {
            const updatedContact = await this.prisma.contact.update({
                where: { id },
                data,
            });

            if (data.picture && data.picture !== existingContact.picture) {
                await this.removePictureFile(existingContact.picture);
            }

            return updatedContact;
        } catch (error) {
            if (data.picture && data.picture !== existingContact.picture) {
                await this.removePictureFile(data.picture);
            }

            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new ConflictException('Email or contact already exists');
            }

            throw error;
        }
    }
}
