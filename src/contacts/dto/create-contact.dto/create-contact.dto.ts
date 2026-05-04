import { IsEmail, IsNotEmpty, IsOptional, Length, Matches } from 'class-validator';

export class CreateContactDto {
  @IsNotEmpty()
  @Length(6)
  name!: string;

  @IsNotEmpty()
  @Matches(/^\d{9}$/, {
    message: 'Contact must have exactly 9 digits',
  })
  contact!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  picture?: string;
}
