import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateProfileDto {
  @IsNotEmpty()
  display_name: string;

  @IsNotEmpty()
  gender: string;

  @IsNotEmpty()
  birthday: string;

  @IsNotEmpty()
  horoscope: string;

  @IsNotEmpty()
  zodiac: string;

  @IsNotEmpty()
  @IsNumber()
  height: number;
  
  @IsNumber()
  @IsNotEmpty()
  weight: number;
}
