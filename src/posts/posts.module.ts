import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from 'src/auth/auth.module';
import PostsController from './posts.controller';
import PostsService from './posts.service';
import Post from './post.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Post])],
  providers: [PostsService],
  controllers: [PostsController],
})
export class PostsModule {}
