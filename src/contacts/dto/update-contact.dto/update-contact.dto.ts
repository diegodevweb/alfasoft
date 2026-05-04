import { IsEmail, IsOptional, Length, Matches } from 'class-validator';

export class UpdateContactDto {
  @IsOptional()
  @Length(6)
  name?: string;

  @IsOptional()
  @Matches(/^\d{9}$/)
  contact?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  picture?: string;
}