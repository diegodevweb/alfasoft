import {
    Injectable,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto/update-contact.dto';

@Injectable()
export class ContactsService {
    constructor(private prisma: PrismaService) { }

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
        await this.findOne(id);
        await this.prisma.contact.delete({
            where: { id },
        });
    }

    async update(id: number, data: UpdateContactDto) {
        await this.findOne(id);

        try {
            return await this.prisma.contact.update({
                where: { id },
                data,
            });
        } catch (error) {
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
