import { Body, Controller, Get, Post, Put, Request } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { DealsService } from '@/deals/deals.service';
import { AuthenticatedRestricted } from '@/decorators/authenticatedRestricted';
import { logger } from '@/logger';
import { NotificationsService } from '@/notifications/notifications.service';
import { BankDetails, User } from '@/users/users.entities';
import { UsersService } from '@/users/users.service';

import { InternalServerError } from '../errors';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/loginResponse.dto';
import { SignupResponseDto } from './dto/signupResponse.dto';
import { SignupDto } from './dto/singup.dto';
import { UpdateNotificationsSettingsDto } from './dto/updateNotificationsSettings.dto';
import { UpdateBankDetailsDto } from './dto/updateBankDetails.dto';
import { UserDetailsResponseDto } from './dto/userDetailsResponse.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
    private dealsService: DealsService,
    private notificationsService: NotificationsService,
  ) { }

  @Get('')
  @AuthenticatedRestricted()
  @ApiResponse({
    status: 200,
    type: UserDetailsResponseDto,
    description: 'Authenticated user details',
  })
  async getUserDetails(@Request() req): Promise<UserDetailsResponseDto> {
    const user: User = req.user;

    const dbUser = await this.userService.findByEmail(user.email);

    return new UserDetailsResponseDto(dbUser);
  }

  @Put('/notifications-settings')
  @AuthenticatedRestricted()
  @ApiResponse({
    status: 200,
    type: UserDetailsResponseDto,
    description: 'Update Notifications Settings',
  })
  async updateNotificationsSettings(
    @Request() req,
    @Body() notificationsSettings: UpdateNotificationsSettingsDto,
  ): Promise<UserDetailsResponseDto> {
    const user: User = req.user;

    const dbUser = await this.userService.updateNotificationsSettings(
      user.id,
      notificationsSettings.desktopNotifications,
      notificationsSettings.emailNotifications,
    );

    return new UserDetailsResponseDto(dbUser);
  }

  @Put('/bank-details')
  @AuthenticatedRestricted()
  @ApiResponse({
    status: 200,
    type: UserDetailsResponseDto,
    description: 'Update supplier bank account details',
  })
  async updateBankDetails(
    @Request() req,
    @Body() body: UpdateBankDetailsDto,
  ): Promise<UserDetailsResponseDto> {
    const user: User = req.user;

    logger.debug({ userId: user.id, bankDetails: body.bankDetails }, 'Updating bank details');

    try {
    const dbUser = await this.userService.updateById(user.id, {
      bankDetails: body.bankDetails as BankDetails,
      isBankLinked: true,
    });

      logger.debug({ userId: user.id, updatedUser: dbUser, bankDetailsInResponse: dbUser?.bankDetails }, 'Bank details updated');

      if (!dbUser) {
        throw new InternalServerError('Failed to update user');
      }

    return new UserDetailsResponseDto(dbUser);
    } catch (error) {
      logger.error({ error, userId: user.id, bankDetails: body.bankDetails }, 'Error updating bank details');
      throw error;
    }
  }

  @Post('login')
  @ApiResponse({
    status: 200,
    type: LoginResponseDto,
    description: 'Login Token',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid token or user not found',
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    const { web3authToken } = loginDto;

    try {
      const token = await this.authService.login(web3authToken);
      return new LoginResponseDto({ token });
    } catch (error) {
      // Re-throw HttpError instances (UnauthorizedError, etc.) as-is
      if (error.statusCode) {
        throw error;
      }
      // Log unexpected errors
      logger.error({ error, web3authToken: web3authToken?.substring(0, 20) + '...' }, 'Unexpected login error');
      throw error;
    }
  }

  @Post('check-user-exists')
  @ApiResponse({
    status: 200,
    description: 'Check if user exists by email',
  })
  async checkUserExists(@Body() body: { email: string }): Promise<{ exists: boolean }> {
    const { email } = body;
    const user = await this.userService.findByEmail(email);
    return { exists: !!user };
  }

  @Post('get-user-by-email')
  @AuthenticatedRestricted()
  @ApiResponse({
    status: 200,
    type: UserDetailsResponseDto,
    description: 'Get user profile by email (for checking supplier bank details)',
  })
  async getUserByEmail(@Body() body: { email: string }): Promise<UserDetailsResponseDto | null> {
    const { email } = body;
    const user = await this.userService.findByEmail(email);
    if (!user) {
      return null;
    }
    return new UserDetailsResponseDto(user);
  }

  @Post('signup')
  @ApiResponse({
    status: 200,
    type: SignupResponseDto,
    description: 'Signup',
  })
  async signup(@Body() signupDto: SignupDto): Promise<SignupResponseDto> {
    const { auth0Token, web3authToken, accountType } = signupDto;

    try {
      let email: string;

      if (auth0Token) {
        // Verify Auth0 JWT token
        const auth0Payload =
          await this.authService.verifyAuth0JwtToken(auth0Token);
        email = auth0Payload.payload.email;

        logger.debug({ auth0Payload }, 'Auth0 JWT token verified');
      }

      // Verify Web3Auth JWT token
      const wallet =
        await this.authService.verifyWeb3AuthJwtToken(web3authToken);
      const walletAddress = wallet.address;
      const walletType = wallet.type;

      // Create new user
      const user = await this.userService.create({
        email,
        walletAddress,
        walletType,
        accountType,
      });

      await this.dealsService.assignUserToDeals(user);

      await this.notificationsService.sendAccountCreatedNotification(email);

      return new SignupResponseDto({
        token: await this.authService.login(web3authToken),
      });
    } catch (e) {
      logger.error(e, 'Signup failed');
      throw new InternalServerError('Signup failed');
    }
  }
}
