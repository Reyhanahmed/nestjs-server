import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import AuthController from '../auth.controller';
import { UsersService } from 'src/users/users.service';
import { AuthService } from '../auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import User from 'src/users/user.entity';
import { JwtService } from '@nestjs/jwt';
import mockedJwtService from 'src/utils/mocks/jwt.service';
import { ConfigService } from '@nestjs/config';
import mockedConfigService from 'src/utils/mocks/config.service';
import mockedUser from './user.mock';

describe('AuthController', () => {
  let app: INestApplication;
  let userData: User;

  beforeEach(async () => {
    userData = {
      ...mockedUser,
    };

    const usersRepository = {
      create: jest.fn(() => userData),
      save: jest.fn(() => Promise.resolve()),
    };

    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        UsersService,
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: usersRepository,
        },
        {
          provide: JwtService,
          useValue: mockedJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockedConfigService,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  describe('when registering', () => {
    describe('and using valid data', () => {
      it('should respond with the data of the user without password', () => {
        const { password, ...expectedData } = userData;
        return request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: mockedUser.email,
            name: mockedUser.name,
            password: 'somePassword',
          })
          .expect(201)
          .expect(expectedData);
      });
    });

    describe('and using invalid data', () => {
      it('should throw an error', () => {
        return request(app.getHttpServer())
          .post('/auth/register')
          .send({
            name: mockedUser.name,
          })
          .expect(400);
      });
    });
  });
});
