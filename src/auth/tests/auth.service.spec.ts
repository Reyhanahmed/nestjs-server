import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { AuthService } from '../auth.service';
import User from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import mockedConfigService from 'src/utils/mocks/config.service';
import mockedJwtService from 'src/utils/mocks/jwt.service';
import mockedUser from './user.mock';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthenticationService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let userData: User;
  let findUser: jest.Mock;
  let bcryptCompare: jest.Mock;

  beforeEach(async () => {
    userData = {
      ...mockedUser,
    };
    findUser = jest.fn(() => userData);
    const usersRepository = {
      findOne: findUser,
    };

    bcryptCompare = jest.fn(() => true);
    (bcrypt.compare as jest.Mock) = bcryptCompare;
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        AuthService,
        { provide: ConfigService, useValue: mockedConfigService },
        { provide: JwtService, useValue: mockedJwtService },
        {
          provide: getRepositoryToken(User),
          useValue: usersRepository,
        },
      ],
    }).compile();
    authService = await module.get<AuthService>(AuthService);
    usersService = await module.get(UsersService);
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
      expect(getByEmailSpy).toHaveBeenCalledTimes(1);
    });

    describe('and the provided password in not valid', () => {
      beforeEach(() => {
        bcryptCompare.mockReturnValue(false);
      });

      it('should throw an error', async () => {
        await expect(
          authService.getAuthenticatedUser('user@email.com', 'somePassword'),
        ).rejects.toThrow();
      });
    });

    describe('and the provided password is valid', () => {
      beforeEach(() => {
        bcryptCompare.mockReturnValue(true);
      });

      describe('and the user is found in the database', () => {
        beforeEach(() => {
          findUser.mockResolvedValue(userData);
        });

        it('should return the user data', async () => {
          const user = await authService.getAuthenticatedUser(
            'user@email.com',
            'somePassword',
          );
          expect(user).toBe(userData);
        });
      });

      describe('and the user is not found in the database', () => {
        beforeEach(() => {
          findUser.mockResolvedValue(undefined);
        });

        it('should throw an error', async () => {
          await expect(
            authService.getAuthenticatedUser('user@email.com', 'somePassword'),
          ).rejects.toThrow();
        });
      });
    });
  });
});
