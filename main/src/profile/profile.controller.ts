import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Request,
  Put,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // create profile /api/profile
  @Post()
  async create(
    @Request() req,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    return {
      data: await this.profileService.create(req.user.id, createProfileDto),
      statusCode: HttpStatus.OK,
      message: 'Register success',
    };
  }

  @Get()
  findAll() {
    return this.profileService.findAll();
  }

  // get profile /api/profile/:userId
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return {
      data: await this.profileService.findOne(id),
      statusCode: HttpStatus.OK,
      message: 'Register success',
    };
  }

  // update profile /api/profile
  @Put('update')
  update(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profileService.update(req.user.id, updateProfileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.profileService.remove(+id);
  }
}
