import {
    Body,
    Controller,
    Get,
    Put,
    Post,
    Delete,
    Param,
    ParseIntPipe,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    UseGuards,
} from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CreateContactDto } from './dto/create-contact.dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto/update-contact.dto';
import { AuthGuard } from '../auth/auth.guard';


@Controller('contacts')
export class ContactsController {
    constructor(private contactsService: ContactsService) { }

    @Get()
    async findAll() {
        return this.contactsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.contactsService.findOne(id);
    }

    @Put(':id')
    @UseGuards(AuthGuard)
    @UseInterceptors(
        FileInterceptor('picture', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    cb(null, uniqueName + extname(file.originalname));
                },
            }),
        }),
    )
    async update(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFile() file: Express.Multer.File,
        @Body() body: UpdateContactDto,
    ) {
        if (file) {
            body.picture = file.filename;
        }

        return this.contactsService.update(id, body);
    }

    @Post()
    @UseGuards(AuthGuard)
    @UseInterceptors(
        FileInterceptor('picture', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    cb(null, uniqueName + extname(file.originalname));
                },
            }),
        }),
    )
    async create(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: CreateContactDto,
    ) {
        if (!file) {
            throw new BadRequestException('Picture is required');
        }

        body.picture = file.filename;

        return this.contactsService.create(body);
    }


    @Delete(':id')
    @UseGuards(AuthGuard)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.contactsService.remove(id);
    }
}
