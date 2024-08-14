import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(id: string, createProfileDto: CreateProfileDto) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: id,
      },
    });

    if (!user) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          error: 'User not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const profile = await this.prismaService.profile.create({
      data: {
        display_name: createProfileDto.display_name,
        gender: createProfileDto.gender,
        birthday: createProfileDto.birthday,
        horoscope: createProfileDto.horoscope,
        zodiac: createProfileDto.zodiac,
        height: createProfileDto.height,
        weight: createProfileDto.weight,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    return profile;
  }

  findAll() {
    return `This action returns all profile`;
  }

  async findOne(id: string) {
    const profile = await this.prismaService.profile.findFirst({
      where: {
        user: {
          id: id,
        },
      },
      include: {
        user: true,
      },
    });

    return profile;
  }

  async update(id: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: id,
      },
      include: {
        profile: true,
      },
    });

    const profile = await this.prismaService.profile.update({
      where: {
        id: user.profile.id,
      },
      data: {
        display_name: updateProfileDto.display_name,
        gender: updateProfileDto.gender,
        birthday: updateProfileDto.birthday,
        horoscope: updateProfileDto.horoscope,
        zodiac: updateProfileDto.zodiac,
        height: updateProfileDto.height,
        weight: updateProfileDto.weight,
      },
    });

    return profile;
  }

  remove(id: number) {
    return `This action removes a #${id} profile`;
  }
}
