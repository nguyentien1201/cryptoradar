import { Controller, Post, Body, Get, UseGuards, Request, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

class RegisterDto {
  @IsEmail()
  email: string;
  @IsString() @MinLength(8)
  password: string;
  @IsString() @MaxLength(50)
  name: string;
}

class LoginDto {
  @IsEmail()
  email: string;
  @IsString()
  password: string;
}

class RefreshDto {
  @IsString()
  refreshToken: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password, dto.name);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getMe(@Request() req) {
    return req.user;
  }

  @Post('telegram/:chatId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  connectTelegram(@Request() req, @Param('chatId') chatId: string) {
    return this.authService.connectTelegram(req.user.id, chatId);
  }
}
