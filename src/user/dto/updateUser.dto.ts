import { IsEmail, IsOptional, IsString, IsStrongPassword } from "class-validator";

export class UpdateUserDto {
    @IsString()
    userId: string;
    @IsString()
    @IsOptional()
    name: string;
    @IsString()
    @IsEmail()
    @IsOptional()
    email: string;
    @IsString()
    @IsStrongPassword()
    @IsOptional()
    password: string;
}