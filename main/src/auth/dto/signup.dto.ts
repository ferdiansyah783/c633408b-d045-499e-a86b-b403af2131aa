import { IsEmail, IsNotEmpty } from "class-validator"

export class SignupDto {
    @IsNotEmpty()
    name: string

    @IsNotEmpty()
    @IsEmail()
    email: string

    @IsNotEmpty()
    password: string
}