import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';

import { AuthService } from '../auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import User from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import mockedConfigService from 'src/utils/mocks/config.service';
import mockedJwtService from 'src/utils/mocks/jwt.service';

describe('AuthenticationService', () => {
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        AuthService,
        { provide: ConfigService, useValue: mockedConfigService },
        { provide: JwtService, useValue: mockedJwtService },
        { provide: getRepositoryToken(User), useValue: {} },
      ],
    }).compile();
    authService = await module.get<AuthService>(AuthService);
    usersService = await module.get<UsersService>(UsersService);
  });

  describe('when creating a cookie', () => {
    it('should return a sring', () => {
      const userId = 1;
      expect(typeof authService.getCookieWithJwtToken(userId)).toBe('string');
    });
  });

  describe('when accessing the data of authenticating user', () => {
    it('should attempt to get the user by email', async () => {
      const getByEmailSpy = jest.spyOn(usersService, 'getByEmail');
      await authService.getAuthenticatedUser('user@email.com', 'somePassword');
      expect(getByEmailSpy).toBeCalledTimes(1);
    });
  });
});
