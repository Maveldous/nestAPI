import {
  Body,
  Req,
  Res,
  Controller,
  HttpCode,
  Post,
  Get,
  UseGuards,
} from '@nestjs/common';
import RegisterDto from './dto/register.dto';
import RequestWithUser from './requestWithUser.interface';
import { LocalAuthenticationGuard } from './localAuthentication.guard';
import { AuthenticationService } from './authentication.service';
import { Response } from 'express';
import JwtAuthenticationGuard from './jwt-authentication.guard';
import { UsersService } from '../users/users.service';
import JwtRefreshGuard from './jwtRefresh.guard';

@Controller('authentication')
// Add to exclude all fields from response
// @SerializeOptions({
//   strategy: 'excludeAll',
// })
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  public async register(@Body() registrationData: RegisterDto) {
    return this.authenticationService.register(registrationData);
  }

  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @Post('log-in')
  async logIn(@Req() request: RequestWithUser) {
    const { user } = request;
    const accessTokenCookie =
      this.authenticationService.getCookieWithJwtAccessToken(user.id);
    const refreshTokenCookie =
      this.authenticationService.getCookieWithJwtRefreshToken(user.id);

    await this.usersService.setCurrentRefreshToken(
      refreshTokenCookie.token,
      user.id,
    );

    request.res.setHeader('Set-Cookie', [
      accessTokenCookie,
      refreshTokenCookie.cookie,
    ]);
    return user;
  }

  @UseGuards(JwtAuthenticationGuard)
  @Get()
  authenticate(@Req() request: RequestWithUser) {
    const user = request.user;
    return user;
  }

  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  refresh(@Req() request: RequestWithUser) {
    const accessTokenCookie =
      this.authenticationService.getCookieWithJwtAccessToken(request.user.id);

    request.res.setHeader('Set-Cookie', accessTokenCookie);
    return request.user;
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post('log-out')
  async logOut(@Req() request: RequestWithUser) {
    await this.usersService.removeRefreshToken(request.user.id);
    request.res.setHeader(
      'Set-Cookie',
      this.authenticationService.getCookiesForLogOut(),
    );
  }
}
