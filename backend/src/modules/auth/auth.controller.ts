import { Controller, Post, Body, UseGuards, Get, Headers, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  async register(@Body() dto: RegisterDto): Promise<any> {
    return this.authService.register(dto.email, dto.password, dto.firstName, dto.lastName);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Headers('authorization') auth: string) {
    const token = auth.replace('Bearer ', '');
    return this.authService.refreshAccessToken(token);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user info' })
  async getCurrentUser(@Request() req: any): Promise<any> {
    if (!req.user) {
      throw new Error('User not found in request');
    }
    // User is attached by JwtAuthGuard from JWT payload validation
    return req.user;
  }
}
