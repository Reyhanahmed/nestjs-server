import { NestFactory, Reflector } from '@nestjs/core';
import {
  BadRequestException,
  ClassSerializerInterceptor,
  ValidationPipe,
} from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ValidationError } from 'class-validator';

import { AppModule } from './app.module';
import { ExcludeNullInterceptor } from './utils/excludeNull.interceptor';
import { ResponseFormatInterceptor } from './utils/responseFormat.interceptor';
import HttpExceptionFilter from './utils/httpException.filter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const mappedValidationErrors = validationErrors.map((error) => ({
          [error.property]: Object.values(error.constraints)[0],
        }));
        return new BadRequestException(mappedValidationErrors);
      },
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalInterceptors(new ExcludeNullInterceptor());
  app.useGlobalInterceptors(new ResponseFormatInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(cookieParser());

  const configService = app.get(ConfigService);

  await app.listen(Number(configService.get('PORT')) || 5000);
}
bootstrap();
